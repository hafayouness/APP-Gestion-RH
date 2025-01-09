<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        try {
           
            if ($request->user()) {
                
                $request->user()->currentAccessToken()->delete();

                return response()->json(['message' => 'Logged out successfully'], 200);
            }

            return response()->json(['error' => 'User not authenticated'], 401);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while logging out', 'details' => $e->getMessage()], 500);
        }
    }
}
