<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        
        $users = User::with('profile')->get();

       
        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }


    

    public function getAuthenticatedUser()
    {
        if (Auth::check()) { 
            $user = Auth::user(); 
                return response()->json([
                'success' => true,
                'user' => $user->load('profile'),
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Aucun utilisateur connecté.',
            ], 401);
        }
    }
    

   

}
