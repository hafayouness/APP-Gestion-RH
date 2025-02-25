<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'pause_start',
        'pause_end',
        'total_minutes_worked',
        'pause_duration_minutes',
        'completed_hours',
        'remaining_minutes',
        'compensation_minutes'
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'pause_start' => 'datetime',
        'pause_end' => 'datetime',
        'completed_hours' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(AttendanceHistory::class);
    }

    public function calculateWorkTime()
    {
        if (!$this->check_in || !$this->check_out) {
            return;
        }

        // Calculer la durée de la pause
        $this->pause_duration_minutes = 0;
        if ($this->pause_start && $this->pause_end) {
            $pause_start = \Carbon\Carbon::parse($this->pause_start);
            $pause_end = \Carbon\Carbon::parse($this->pause_end);
            $this->pause_duration_minutes = $pause_end->diffInMinutes($pause_start);
        }

        // Calculer le temps total travaillé
        $check_in = \Carbon\Carbon::parse($this->check_in);
        $check_out = \Carbon\Carbon::parse($this->check_out);
        $total_minutes = $check_out->diffInMinutes($check_in) - $this->pause_duration_minutes;
        
        $this->total_minutes_worked = $total_minutes;
        $this->remaining_minutes = 480 - $total_minutes; // 8 heures en minutes = 480
        $this->completed_hours = $total_minutes >= 480;

        // Gérer la compensation
        if ($this->remaining_minutes < 0) {
            // Si l'employé a travaillé plus de 8 heures, ajouter aux minutes de compensation
            $this->compensation_minutes = abs($this->remaining_minutes);
            $this->remaining_minutes = 0;
        }

        $this->save();

        // Ajouter l'événement à l'historique
        AttendanceHistory::logAction(
            $this->id,
            $this->user_id,
            'calculate_work_time',
            'Calcul du temps de travail',
            [
                'total_minutes' => $total_minutes,
                'pause_duration' => $this->pause_duration_minutes,
                'remaining_minutes' => $this->remaining_minutes,
                'compensation_minutes' => $this->compensation_minutes,
                'completed_hours' => $this->completed_hours
            ]
        );
    }
}