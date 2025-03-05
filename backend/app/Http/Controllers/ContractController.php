<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ContractController extends Controller
{
    
    public function index(){
        if (auth()->user()->role_id !== 'admin') {
            return response()->json(['message' => 'Accès refusé. Seul un administrateur peut voir les contrats.'], 403);

        }
        $contracts = Contract::with('user:id,name,email')->get();
        return response()->json($contracts);

    }
   
    public function store(Request $request) 
    {
      
        if (!auth()->check()) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }
    
        
        if (auth()->user()->role_id !== 'admin') {
            return response()->json(['message' => 'Seul un administrateur peut créer un contrat.'], 403);
        }
    
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|exists:users,email',
            'type' => 'required|in:CDI,CDD,Stage',
            'start_date' => 'required|date|date_format:Y-m-d',
            'document' => 'nullable|string|max:1000'
        ];
    
        
        if ($request->type != 'CDI') {
            $rules['end_date'] = 'required|date|date_format:Y-m-d|after:start_date';
        }
    
        $validator = Validator::make($request->all(), $rules);
    
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Erreurs de validation'
            ], 400);
        }
    
        
        $user = User::where('name', $request->name)
                    ->where('email', $request->email)
                    ->first();
    
        if (!$user) {
            return response()->json(['message' => 'Aucun utilisateur trouvé avec ce nom et cet email.'], 404);
        }
    
        
        $existingContract = Contract::where('user_id', $user->id)->exists();
    
        if ($existingContract) {
            return response()->json(['message' => 'Cet utilisateur a déjà un contrat.'], 400);
        }
    
        try {
            
            $startDate = Carbon::parse($request->start_date);
    
          
            if ($request->type === 'CDI') {
                $endDate = null;
                $duration = null; 
            } else {
                $endDate = Carbon::parse($request->end_date);
                $duration = $startDate->diffInMonths($endDate);
            }
    
            $contract = Contract::create([
                'user_id' => $user->id,
                'type' => $request->type,
                'start_date' => $request->start_date,
                'end_date' => $endDate ? $endDate->format('Y-m-d') : null,
                'duration' => $duration,
                'document' => $request->document ?? null
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'Contrat créé avec succès',
                'contract' => array_merge(
                    $contract->toArray(),
                    ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email]]
                )
            ], 201);
    
        } catch (\Exception $e) {
            Log::error('Contract Creation Error: ' . $e->getMessage());
            Log::error('Request Data: ' . json_encode($request->all()));
            
            return response()->json([
                'message' => 'Une erreur technique est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }   
 
    // public function update(Request $request,$id){
    //     if(auth()->user()->role_id !== "admin"){
    //         return response()->json(["message"=>"Seul un administrateur peut modifier un contrat"],403);
    //     }

    //     $validator = Validator::make($request->all(),[
    //         "type"=>"sometimes|in:CDI,CDD,Stage",
    //         "start_date"=>"sometimes|date",
    //         "end_date"=>"nullable|date|after:start_date",

    //     ]);

    //     if($validator->fails()){
    //         return response()->json(['errors' => $validator->errors()], 400);

    //     }
    //     $contract = Contract::find($id);
    //     if (!$contract) {
    //         return response()->json(['message' => 'Contrat non trouvé.'], 404);
    //     }

    //     $contract->update([
    //         'type' => $request->type,
    //         'start_date' => $request->start_date,
    //         'end_date' => $request->end_date,
    //         'duration' => $request->end_date ? Carbon::parse($request->start_date)->diffInMonths(Carbon::parse($request->end_date)) : null

    //     ]);

    //     return response()->json(['message' => 'Contrat mis à jour avec succès', 'contract' => $contract], 200);

    // }
    public function update(Request $request, $id)
    {
        if(auth()->user()->role_id !== "admin"){
            return response()->json(["message"=>"Seul un administrateur peut modifier un contrat"], 403);
        }
    
        // Règles de validation dynamiques
        $rules = [
            "type" => "sometimes|in:CDI,CDD,Stage",
            "start_date" => "sometimes|date",
        ];
    
        // Validation conditionnelle pour la date de fin
        if ($request->type !== 'CDI') {
            $rules['end_date'] = 'required|date|after:start_date';
        } else {
            $rules['end_date'] = 'nullable';
        }
    
        $validator = Validator::make($request->all(), $rules);
    
        if($validator->fails()){
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        $contract = Contract::find($id);
        if (!$contract) {
            return response()->json(['message' => 'Contrat non trouvé.'], 404);
        }
    
        
        $updateData = [
            'type' => $request->type,
            'start_date' => $request->start_date,
        ];
    
        
        if ($request->type === 'CDI') {
            $updateData['end_date'] = null;
            $updateData['duration'] = null;
        } else {
            
            $updateData['end_date'] = $request->end_date;
            $updateData['duration'] = Carbon::parse($request->start_date)
                ->diffInMonths(Carbon::parse($request->end_date));
        }
    
        $contract->update($updateData);
    
        return response()->json([
            'message' => 'Contrat mis à jour avec succès', 
            'contract' => $contract
        ], 200);
    }
    public function delete($id){
        if(auth()->user()->role_id !== "admin"){
            return response()->json(["message"=>"Seul un administrateur peut supprimer un contrat"],403);
        }

        $contract = Contract::find($id);
        if(!$contract){
            return response()->json(['message'=> "Contrat non  trouvé."],404);
        }
        $contract->delete();
        return response()->json(['message'=>"Contrat supprimé avec succès. "],200);
    }
}
