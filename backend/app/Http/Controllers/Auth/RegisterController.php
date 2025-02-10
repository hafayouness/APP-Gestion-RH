<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        "password" => "required|min:8",
        "phone" => "nullable|string|max:20",
        "address" => "nullable|string|max:255",
        "role_id" => "nullable|string|in:admin,manager,employer,stagiaire",
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
        'role_id' => $validated['role_id'] ?? 'employer',
        'phone' => $validated['phone'] ?? null,
    ]);

    
    $photoPath = null;

    if ($request->filled('photo')) {
        try {
            
            
            Log::info('Profile Photo Received', [
                'photo' => substr($request->input('photo'), 0, 100) . '...' 
            ]);
             $imageData = $request->input('photo');
            if (strpos($imageData, 'data:image/') === 0) {
                list($type, $imageData) = explode(';', $imageData);
                list(, $imageData) = explode(',', $imageData);
            }

            $image = base64_decode($imageData);

            if ($image === false) {
                throw new \Exception('Le format de la photo est invalide ou non décodable.');
            }

            
            $imageName = Str::uuid() . '.jpg';
            $path = 'profile_photos/' . $imageName;
            Storage::disk('public')->put($path, $image);

            $photoPath = $path;
            Log::info('Image uploaded successfully', ['path' => $path]);

        } catch (\Exception $e) {
            Log::error('Image upload error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du traitement de la photo.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

   
    Profile::create([
        "user_id" => $user->id,
        "phone" => $validated['phone'] ?? null,
        "address" => $validated['address'] ?? null,
        'photo' => $photoPath ? asset('storage/' . $photoPath) : null,
    ]);

    return response()->json([
        'message' => 'Utilisateur enregistré avec succès.',
        'user' => $user->load('profile'),
    ]);
}

    


    
    
    









    
}




