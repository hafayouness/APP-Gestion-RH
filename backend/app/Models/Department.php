<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;
    // table lier a User
    public function users()
    {
       return $this->hasMany(User::class);
    }
    // table lier a emplyees
    public function employees()
    {
      return $this->hasMany(Employee::class);
    }
}
