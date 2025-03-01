<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Employee extends Model
{
    use HasFactory;
    protected $fillable =["user_id","employee_number","department","position","hire_date" ,'phone_number',];

    // table lier a user
    public function users()
   {
      return $this->belongsTo(User::class);
   }

    // table lier a departement
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function contractable(): MorphTo
    {
        return $this->morphTo();
    }
   
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }
}
