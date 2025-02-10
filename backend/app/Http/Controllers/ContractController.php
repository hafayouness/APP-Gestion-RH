<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
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
       
        if (auth()->user()->role_id !== 'admin') {
            return response()->json(['message' => 'Seul un administrateur peut créer un contrat.'], 403);
        }

        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'type' => 'required|in:CDI,CDD,Stage',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'document' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
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

       
        $startDate = Carbon::parse($request->start_date);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : null;
        $duration = $endDate ? $startDate->diffInMonths($endDate) : null;

        
        $contract = Contract::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'duration' => $duration,
            'document' => $request->document
        ]);

        return response()->json([
            'message' => 'Contrat créé avec succès',
            'contract' => array_merge(
                $contract->toArray(),
                ['user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email]]
            )
        ], 201);
    }
}
