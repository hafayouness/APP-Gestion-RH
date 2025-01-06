<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class absence extends Model
{
    use HasFactory;
    protected $fillable = [
        'employee_id',
        'date',
        'reason',
        'status',
    ];
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
