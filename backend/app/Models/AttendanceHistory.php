<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'user_id',
        'action_type',
        'description',
        'data'
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Fonction utilitaire pour créer un enregistrement d'historique
     */
    public static function logAction($attendanceId, $userId, $actionType, $description = null, $data = null)
    {
        return self::create([
            'attendance_id' => $attendanceId,
            'user_id' => $userId,
            'action_type' => $actionType,
            'description' => $description,
            'data' => $data
        ]);
    }
}