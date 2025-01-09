<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
     public function login(Request $request){
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);
        if($validator->fails()){
            return response()->json(["error" => $validator->errors()],422);
        }
        
        if(!Auth::attempt($request->only("email","password"))){
            return response()->json([
                "message"=>"invalid login credentials"
            ],401);
        }
        $user = User::where("email",$request->email)->firstOrFail();
        $token = $user->createToken("auth_token")->plainTextToken;

        return response()->json([
            "user"=> $user,
            "token" => $token
        ]);

     }
     
    
}
