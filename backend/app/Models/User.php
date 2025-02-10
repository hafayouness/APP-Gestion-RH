<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role_id', 
        'status',  
        // 'department_id'
        
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }
      
     
    //  table lier avec profile

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }
    //  table lier avec departement
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function isAdmin()
    {
        return $this->role_id === 'admin';
    }

    public function isManager()
    {
        return $this->role_id === 'manager';
    }

    public function isActive()
    {
        return $this->status === 'active';
    } 
    public function sendPasswordResetNotification($token)
    {
        $frontendUrl = "http://localhost:3000/reset-password?token={$token}";
        $this->notify(new \App\Notifications\ResetPasswordNotification($frontendUrl));
    }
}
