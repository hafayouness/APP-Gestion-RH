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
use App\Notifications\ResetPasswordNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use App\Models\User;

class PasswordResetController extends Controller
{
   

    public function sendResetLink(Request $request)
{
    
    $request->validate(['email' => 'required|email']);

    
    $status = Password::sendResetLink($request->only('email'));

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json([
            'message' => __('Un e-mail de réinitialisation a été envoyé à :email.', ['email' => $request->email]),
            'redirectUrl' => 'http://localhost:3000/reset-password'
        ], 200);
    }

   
    return response()->json([
        'message' => __('Impossible d\'envoyer l\'e-mail de réinitialisation. Veuillez vérifier l\'adresse e-mail.'),
    ], 400);
}

    

   
    public function reset(Request $request)
    {
        
        $request->validate([
            'email' => 'required|email',
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed', 
        ]);
    
        
        $user = User::where('email', $request->email)->first();
    
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    
       
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'The current password is incorrect.'], 400);
        }
    
       
        $user->password = Hash::make($request->new_password);
        $user->save();
    
        
        return response()->json(['message' => 'Password has been successfully updated.'], 200);
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