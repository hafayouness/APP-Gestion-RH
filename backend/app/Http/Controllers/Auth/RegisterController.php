<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users",
            "password" => "required|min:8|confirmed",
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "role_id" => "nullable|string|in:admin,manager,employee",
            "photo" => "nullable|string",
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'] ?? 'employee', 
            "phone" => $validated['phone'] ?? null,
        ]);

        $photoPath = null;

        
        if ($request->filled('photo')) {
            try {
                Log::info('Photo Received', [
                    'photo_preview' => substr($request->input('photo'), 0, 100) . '...'
                ]);

                $imageData = $request->input('photo');

           
                if (strpos($imageData, 'data:image/') === 0) {
                    list(, $imageData) = explode(',', $imageData);
                }

                $image = base64_decode($imageData);

                if ($image === false) {
                    throw new \Exception('Unable to decode image');
                }

                
                $imageName = Str::uuid() . '.jpg';
                $path = 'profile_photos/' . $imageName;

            
                Storage::disk('public')->put($path, $image);

                $photoPath = $path;
                Log::info('Image uploaded successfully', ['path' => $path]);
            } catch (\Exception $e) {
                Log::error('Image upload error: ' . $e->getMessage());
                $photoPath = null;
            }
        }

      
        Profile::create([
            "user_id" => $user->id,
            "phone" => $validated['phone'] ?? null,
            "address" => $validated['address'] ?? null,
            "photo" => $photoPath,
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user->load('profile'), 
        ]);
    }
}
