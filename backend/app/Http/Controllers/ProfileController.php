<?php

namespace App\Http\Controllers;

use App\Mail\TemporaryPasswordMail;
use App\Models\Profile; // Correction du nom de modèle avec une majuscule
use App\Models\User;
use App\Services\TwilioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Twilio\Rest\Client;

class ProfileController extends Controller
{ 
    // get user profile
    public function show($userId)
    {
        $user = User::with('profile')->where('id', $userId)->first();
        
        

        if (!$user) {
            return response()->json([
                "success" => false,
                "message" => "Utilisateur introuvable"
            ], 404);

        }
        

        return response()->json([
            "success" => true,
             'user' => $user, 
            // 'profile' => $user->profile
        ]);
    }

  
//  Ajouter l'user 

    public function store(Request $request)
    {
      
        if (auth()->user()->role_id !== "admin") {
            return response()->json([
                'message' => 'Accès refusé. Seuls les administrateurs peuvent ajouter des utilisateurs.'
            ], 403);
        }

      
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "email" => "required|email|unique:users,email",
            "role_id" => "nullable|string|in:manager,employer,stagiaire",  
            "phone" => "nullable|string|max:20",
            "address" => "nullable|string|max:255",
            "password" => "required|string|min:8", 
            "photo" => "nullable|string",
        ]);

        
        if ($validator->fails()) {
            return response()->json(["errors" => $validator->errors()], 422);
        }

        
        $validated = $validator->validated();

        
        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "role_id" => $request->role_id ?? 'employer', 
            "phone" => $request->phone,
            "address" => $request->address,
            "photo" => $request->photo,
            "password" => Hash::make($request->password), 
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
            'message' => "Utilisateur {$user->role_id} créé avec succès.",
            'user' => $user->load('profile')
        ], 201);
    }
   






       
        //   Update user profile
          
        public function updateProfile(Request $request, $userId)
        {
            if (!auth()->check()) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
        
            $validator = Validator::make($request->all(), [
                "name" => "sometimes|string|max:255",
                "email" => "sometimes|string|email",
                "phone" => "sometimes|string|max:20",
                "address" => "sometimes|string|max:255",
                "photo" => "sometimes|nullable|string",
            ]);
        
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
        
            $validated = $validator->validated();
            $user = User::findOrFail($userId);
        
            $authenticatedUser = auth()->user();
            if ($authenticatedUser->id !== $user->id && $authenticatedUser->role_id !== 'admin') {
                return response()->json(['message' => 'Non autorisé à modifier ce profil.'], 403);
            }
        
            
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }
            if (isset($validated['phone'])) {
                $user->phone = $validated['phone'];
            }
            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }
            $user->save();
        
            
            $photoPath = $user->profile ? $user->profile->photo : null;
        
            if ($request->filled('photo')) {
                try {
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
        
                   
                    if ($photoPath) {
                        $oldPath = str_replace(asset('storage/'), '', $photoPath);
                        if (Storage::disk('public')->exists($oldPath)) {
                            Storage::disk('public')->delete($oldPath);
                        }
                    }
        
                    $photoPath = asset('storage/' . $path);
                } catch (\Exception $e) {
                    return response()->json([
                        'message' => 'Erreur lors du traitement de la photo.',
                        'error' => $e->getMessage(),
                    ], 422);
                }
            }
        
            
            try {
                $profile = $user->profile;
                if ($profile) {
                    $profile->update([
                        'phone' => $validated['phone'] ?? $profile->phone,
                        'address' => $validated['address'] ?? $profile->address,
                        'photo' => $photoPath ?? $profile->photo,
                    ]);
                } else {
                    Profile::create([
                        'user_id' => $user->id,
                        'phone' => $validated['phone'] ?? null,
                        'address' => $validated['address'] ?? null,
                        'photo' => $photoPath,
                    ]);
                }
        
                return response()->json([
                    'message' => 'Profil mis à jour avec succès.',
                    'user' => $user->load('profile'),
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Erreur lors de la mise à jour du profil.',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }
        
    
        /**
         * Delete user
         */
        

        public function destroy($userId)
        {
            try {

                $authUser = Auth::user();
        
                
                if ($authUser->role_id !== 'admin') {
                    return response()->json([
                        'message' => 'You do not have permission to delete this user',
                        'status' => 'error',
                    ], 403);  
                }
        
              
                $user = User::findOrFail($userId);
        
               
                $user->profile()->delete();
        
                
                $user->delete();
        
                return response()->json([
                    'message' => 'User and profile deleted successfully',
                    'status' => 'success',
                ], 200);
        
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Failed to delete user and profile',
                    'status' => 'error',
                ], 500);
            }
        }
        
        
    



    
}
