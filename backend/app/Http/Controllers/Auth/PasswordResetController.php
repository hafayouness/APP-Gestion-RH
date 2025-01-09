<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;


class PasswordResetController extends Controller
{
   

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
       
        $status = Password::sendResetLink($request->only('email'));
    
        
        $token = Str::random(64); 
        $hashedToken = Hash::make($token); 
        
        DB::table('password_resets')->updateOrInsert(
                ['email' => $request->email],
                ['token' => $hashedToken, 'created_at' => now()]
            );
    
        return response()->json([
            'status' => $status,
            'message' => __($status),
            'debug' => [
                'token' => $token,
                'email' => $request->email
            ]
        ]);
    }
    

    public function reset(Request $request)
    {
        Log::info('Reset Request Data:', $request->all());
    
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);
    
       
        $resetEntry = DB::table('password_resets')
            ->where('email', $request->email)
            ->first();
    
        if (!$resetEntry) {
            return response()->json(['message' => 'No reset entry found for this email.'], 400);
        }
    
        Log::info('Password Reset Table Entry:', (array) $resetEntry);
    
      
        if (!Hash::check($request->token, $resetEntry->token)) {
            return response()->json([
                'message' => 'Token mismatch.',
                'debug' => [
                    'provided_token' => $request->token,
                    'stored_token' => $resetEntry->token,
                ],
            ], 400);
        }
    
        
        $tokenCreatedAt = $resetEntry->created_at;
        if (Carbon::parse($tokenCreatedAt)->addMinutes(config('auth.passwords.users.expire'))->isPast()) {
            return response()->json(['message' => 'Token has expired.'], 400);
        }
    
        
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );
    
        Log::info('Reset Status:', ['status' => $status]);
    
       
        if ($status === Password::PASSWORD_RESET) {
            DB::table('password_resets')->where('email', $request->email)->delete();
        }
    
        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['message' => __($status)], 400);
    }
    

    public function debugReset() {
       
        $tableExists = Schema::hasTable('password_resets');
        
        
        $resets = DB::table('password_resets')->get();
        
        
        $columns = Schema::getColumnListing('password_resets');
        
        return [
            'table_exists' => $tableExists,
            'resets' => $resets,
            'columns' => $columns
        ];
    }
}