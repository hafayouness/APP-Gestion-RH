<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Contract extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'type', 'duration', 'start_date', 'end_date', 'document'];
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
