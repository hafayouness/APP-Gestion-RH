<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        try {
            if ($request->user()) {
               
                $token = $request->user()->currentAccessToken();
                
                if ($token instanceof PersonalAccessToken) {
                    $token->delete();
                }
                
             
                if (auth()->guard('web')->check()) {
                    auth()->guard('web')->logout();
                }
                
                return response()->json(['message' => 'Logged out successfully'], 200);
            }
            
            return response()->json(['error' => 'User not authenticated'], 401);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while logging out', 'details' => $e->getMessage()], 500);
        }
    }
}