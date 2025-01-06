<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;
    protected $fillable = [
        'employee_id',
        'start_date',
        'end_date',
        'type',
        'salary',
    ];
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
