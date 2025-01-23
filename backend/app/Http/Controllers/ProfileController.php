<?php

namespace App\Http\Controllers;

use App\Models\Profile; // Correction du nom de modèle avec une majuscule
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProfileController extends Controller
{ 
    // get user profile
    public function show($userId)
    {
        $user = User::with('profile')->where('id', $userId)->first();
        
        // $profile = Profile::where("user_id", $userId)->first();

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
       
        //   Update user profile
         
        public function updateProfile(Request $request, $userId)
        {
            if (!auth()->check()) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
    
            $validator = Validator::make($request->all(), [
                "name" => "sometimes|string|max:255",
                "phone" => "sometimes|string|max:20",
                "address" => "sometimes|string|max:255",
                "photo" => "sometimes|nullable|string",
            ]);
     
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
    
            $validated = $validator->validated();
    
            $user = User::findOrFail($userId);
    
            if (!$user) {
                return response()->json(['message' => 'Utilisateur introuvable.'], 404);
            }
    
            $authenticatedUser = auth()->user();
            if ($authenticatedUser->id !== $user->id) {
                return response()->json(['message' => 'Non autorisé à modifier ce profil.'], 403);
            }
    
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
                $user->save();
            }
            if (isset($validated['phone'])) {
                $user->phone = $validated['phone'];
                $user->save();
            }
    
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
    
                    // Delete old photo if exists
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
                        'error' => $e->getMessage()
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
                    'error' => $e->getMessage()
                ], 500);
            }
        }
    
        /**
         * Delete profile photo
         */
        // public function deleteProfilePhoto($userId)
        // {
        //     if (!auth()->check()) {
        //         return response()->json(['message' => 'Non authentifié.'], 401);
        //     }
    
        //     $user = User::with('profile')->find($userId);
    
        //     if (!$user) {
        //         return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        //     }
    
        //     if (auth()->user()->id !== $user->id) {
        //         return response()->json(['message' => 'Non autorisé à modifier ce profil.'], 403);
        //     }
    
        //     try {
        //         if ($user->profile && $user->profile->photo) {
        //             $photoPath = str_replace(asset('storage/'), '', $user->profile->photo);
        //             if (Storage::disk('public')->exists($photoPath)) {
        //                 Storage::disk('public')->delete($photoPath);
        //             }
    
        //             $user->profile->update(['photo' => null]);
        //         }
    
        //         return response()->json([
        //             'message' => 'Photo de profil supprimée avec succès.',
        //             'user' => $user->load('profile'),
        //         ]);
        //     } catch (\Exception $e) {
        //         return response()->json([
        //             'message' => 'Erreur lors de la suppression de la photo.',
        //             'error' => $e->getMessage()
        //         ], 500);
        //     }
        // }
    



    
}
