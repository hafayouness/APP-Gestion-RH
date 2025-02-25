<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $attendances = Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->paginate(10);
            
        return view('attendances.index', compact('attendances'));
    }
    
    public function checkIn(Request $request)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();
        
        // Vérifier si une entrée existe déjà pour aujourd'hui
        $attendance = Attendance::firstOrNew([
            'user_id' => $user->id,
            'date' => $today
        ]);
        
        if (!$attendance->check_in) {
            $attendance->check_in = Carbon::now();
            $attendance->save();
            
            // Enregistrer dans l'historique
            AttendanceHistory::logAction(
                $attendance->id,
                $user->id,
                'check_in',
                'Pointage d\'entrée',
                ['time' => $attendance->check_in->format('H:i:s')]
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Check-in effectué avec succès',
                'attendance' => $attendance
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Vous avez déjà fait votre check-in aujourd\'hui'
        ]);
    }
    
    public function startPause(Request $request)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();
        
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();
            
        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez d\'abord faire votre check-in'
            ]);
        }
        
        if ($attendance->pause_start && !$attendance->pause_end) {
            return response()->json([
                'success' => false,
                'message' => 'Vous êtes déjà en pause'
            ]);
        }
        
        $attendance->pause_start = Carbon::now();
        $attendance->pause_end = null;
        $attendance->save();
        
        // Enregistrer dans l'historique
        AttendanceHistory::logAction(
            $attendance->id,
            $user->id,
            'pause_start',
            'Début de pause',
            ['time' => $attendance->pause_start->format('H:i:s')]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Pause démarrée avec succès',
            'attendance' => $attendance
        ]);
    }
    
    public function endPause(Request $request)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();
        
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();
            
        if (!$attendance || !$attendance->pause_start || $attendance->pause_end) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune pause active trouvée'
            ]);
        }
        
        $attendance->pause_end = Carbon::now();
        $attendance->save();
        
        // Calculer la durée de la pause
        $pause_start = Carbon::parse($attendance->pause_start);
        $pause_end = Carbon::parse($attendance->pause_end);
        $pause_duration = $pause_end->diffInMinutes($pause_start);
        
        $attendance->pause_duration_minutes = $pause_duration;
        $attendance->save();
        
        // Enregistrer dans l'historique
        AttendanceHistory::logAction(
            $attendance->id,
            $user->id,
            'pause_end',
            'Fin de pause',
            [
                'time' => $attendance->pause_end->format('H:i:s'),
                'duration_minutes' => $pause_duration
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Pause terminée avec succès',
            'attendance' => $attendance
        ]);
    }
    
    public function checkOut(Request $request)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();
        
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();
            
        if (!$attendance || !$attendance->check_in) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez d\'abord faire votre check-in'
            ]);
        }
        
        if ($attendance->check_out) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà fait votre check-out aujourd\'hui'
            ]);
        }
        
        // Vérifier si une pause est active
        if ($attendance->pause_start && !$attendance->pause_end) {
            return response()->json([
                'success' => false,
                'message' => 'Veuillez terminer votre pause avant de faire le check-out'
            ]);
        }
        
        $attendance->check_out = Carbon::now();
        $attendance->save();
        
        // Enregistrer dans l'historique
        AttendanceHistory::logAction(
            $attendance->id,
            $user->id,
            'check_out',
            'Pointage de sortie',
            ['time' => $attendance->check_out->format('H:i:s')]
        );
        
        // Calculer les heures travaillées
        $attendance->calculateWorkTime();
        
        $response = [
            'success' => true,
            'message' => 'Check-out effectué avec succès',
            'attendance' => $attendance,
        ];
        
        if (!$attendance->completed_hours) {
            $response['warning'] = 'Attention! Vous n\'avez pas complété vos 8 heures de travail aujourd\'hui. Il vous reste ' 
                . floor($attendance->remaining_minutes / 60) . 'h' . ($attendance->remaining_minutes % 60) . 'm à travailler.';
        } else {
            $response['status'] = 'Félicitations! Vous avez terminé vos heures de travail pour aujourd\'hui.';
            
            if ($attendance->compensation_minutes > 0) {
                $response['compensation'] = 'Vous avez travaillé ' 
                    . floor($attendance->compensation_minutes / 60) . 'h' . ($attendance->compensation_minutes % 60) 
                    . 'm de plus. Ces minutes pourront être utilisées comme compensation.';
            }
        }
        
        return response()->json($response);
    }
    
    public function compensate(Request $request)
    {
        $request->validate([
            'attendance_id' => 'required|exists:attendances,id',
            'minutes_to_compensate' => 'required|integer|min:1'
        ]);
        
        $user = Auth::user();
        $attendanceToCompensate = Attendance::findOrFail($request->attendance_id);
        
        // Vérifier que l'utilisateur est propriétaire de cette présence
        if ($attendanceToCompensate->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier cette présence'
            ]);
        }
        
        // Trouver toutes les présences avec des minutes de compensation disponibles
        $compensationAttendances = Attendance::where('user_id', $user->id)
            ->where('compensation_minutes', '>', 0)
            ->orderBy('date', 'desc')
            ->get();
            
        $minutes_needed = $request->minutes_to_compensate;
        $minutes_compensated = 0;
        
        $compensationSources = [];
        
        foreach ($compensationAttendances as $compensationAttendance) {
            $minutes_available = $compensationAttendance->compensation_minutes;
            
            if ($minutes_available >= $minutes_needed) {
                // Assez de minutes dans cette présence
                $used_from_this_attendance = $minutes_needed;
                $compensationAttendance->compensation_minutes -= $minutes_needed;
                $compensationAttendance->save();
                
                $compensationSources[] = [
                    'date' => $compensationAttendance->date->format('Y-m-d'),
                    'minutes_used' => $used_from_this_attendance
                ];
                
                // Enregistrer dans l'historique
                AttendanceHistory::logAction(
                    $compensationAttendance->id,
                    $user->id,
                    'compensation_source',
                    'Minutes utilisées pour compensation',
                    [
                        'minutes_used' => $used_from_this_attendance,
                        'target_date' => $attendanceToCompensate->date->format('Y-m-d')
                    ]
                );
                
                $minutes_compensated += $minutes_needed;
                $minutes_needed = 0;
                break;
            } else {
                // Utiliser toutes les minutes disponibles et continuer
                $used_from_this_attendance = $minutes_available;
                $minutes_needed -= $minutes_available;
                $minutes_compensated += $minutes_available;
                
                $compensationSources[] = [
                    'date' => $compensationAttendance->date->format('Y-m-d'),
                    'minutes_used' => $used_from_this_attendance
                ];
                
                // Enregistrer dans l'historique
                AttendanceHistory::logAction(
                    $compensationAttendance->id,
                    $user->id,
                    'compensation_source',
                    'Minutes utilisées pour compensation',
                    [
                        'minutes_used' => $used_from_this_attendance,
                        'target_date' => $attendanceToCompensate->date->format('Y-m-d')
                    ]
                );
                
                $compensationAttendance->compensation_minutes = 0;
                $compensationAttendance->save();
            }
        }
        
        // Appliquer la compensation
        if ($minutes_compensated > 0) {
            $original_remaining = $attendanceToCompensate->remaining_minutes;
            $attendanceToCompensate->remaining_minutes -= $minutes_compensated;
            
            if ($attendanceToCompensate->remaining_minutes <= 0) {
                $attendanceToCompensate->completed_hours = true;
                
                // S'il y a un surplus, l'ajouter aux minutes de compensation
                if ($attendanceToCompensate->remaining_minutes < 0) {
                    $attendanceToCompensate->compensation_minutes = abs($attendanceToCompensate->remaining_minutes);
                    $attendanceToCompensate->remaining_minutes = 0;
                }
            }
            
            $attendanceToCompensate->save();
            
            // Enregistrer dans l'historique
            AttendanceHistory::logAction(
                $attendanceToCompensate->id,
                $user->id,
                'compensation_applied',
                'Compensation appliquée',
                [
                    'minutes_compensated' => $minutes_compensated,
                    'before_remaining' => $original_remaining,
                    'after_remaining' => $attendanceToCompensate->remaining_minutes,
                    'compensation_sources' => $compensationSources
                ]
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Compensation appliquée avec succès',
                'minutes_compensated' => $minutes_compensated,
                'attendance' => $attendanceToCompensate
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Pas assez de minutes de compensation disponibles'
        ]);
    }
    
    public function stats(Request $request)
    {
        $user = Auth::user();
        
        // Obtenir les statistiques pour la semaine en cours
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        
        $weekAttendances = Attendance::where('user_id', $user->id)
            ->whereBetween('date', [$startOfWeek, $endOfWeek])
            ->get();
            
        $totalMinutesThisWeek = $weekAttendances->sum('total_minutes_worked');
        $totalHoursThisWeek = floor($totalMinutesThisWeek / 60);
        $totalMinutesRemainderThisWeek = $totalMinutesThisWeek % 60;
        
        $expectedWeeklyMinutes = 5 * 480; // 5 jours x 8 heures
        $completionPercentage = round(($totalMinutesThisWeek / $expectedWeeklyMinutes) * 100, 2);
        
        $compensationBalance = Attendance::where('user_id', $user->id)
            ->sum('compensation_minutes');
            
        return response()->json([
            'success' => true,
            'weekly_stats' => [
                'total_time' => $totalHoursThisWeek . 'h' . $totalMinutesRemainderThisWeek . 'm',
                'total_minutes' => $totalMinutesThisWeek,
                'completion_percentage' => $completionPercentage,
                'expected_weekly_minutes' => $expectedWeeklyMinutes
            ],
            'compensation_balance' => $compensationBalance,
            'compensation_hours' => floor($compensationBalance / 60),
            'compensation_minutes' => $compensationBalance % 60
        ]);
    }
    
    public function history(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'date' => 'nullable|date',
            'attendance_id' => 'nullable|exists:attendances,id',
            'action_type' => 'nullable|string',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);
        
        $query = AttendanceHistory::with('attendance')
            ->where('user_id', $user->id);
            
        // Filtrer par date spécifique
        if ($request->has('date')) {
            $date = Carbon::parse($request->date)->toDateString();
            $query->whereHas('attendance', function ($q) use ($date) {
                $q->where('date', $date);
            });
        }
        
        // Filtrer par plage de dates
        if ($request->has('from_date') && $request->has('to_date')) {
            $fromDate = Carbon::parse($request->from_date)->toDateString();
            $toDate = Carbon::parse($request->to_date)->toDateString();
            
            $query->whereHas('attendance', function ($q) use ($fromDate, $toDate) {
                $q->whereBetween('date', [$fromDate, $toDate]);
            });
        }
        
        // Filtrer par ID de présence
        if ($request->has('attendance_id')) {
            $query->where('attendance_id', $request->attendance_id);
        }
        
        // Filtrer par type d'action
        if ($request->has('action_type')) {
            $query->where('action_type', $request->action_type);
        }
        
        // Trier par date et heure de création
        $histories = $query->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return response()->json([
            'success' => true,
            'histories' => $histories
        ]);
    }
    
    public function userActivity(Request $request)
    {
        // Cette méthode est réservée aux administrateurs
        if (!Auth::user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'date' => 'nullable|date',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
            'action_type' => 'nullable|string',
        ]);
        
        $query = AttendanceHistory::with(['attendance', 'user']);
        
        // Filtrer par utilisateur
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filtrer par date spécifique
        if ($request->has('date')) {
            $date = Carbon::parse($request->date)->toDateString();
            $query->whereHas('attendance', function ($q) use ($date) {
                $q->where('date', $date);
            });
        }
        
        // Filtrer par plage de dates
        if ($request->has('from_date') && $request->has('to_date')) {
            $fromDate = Carbon::parse($request->from_date)->toDateString();
            $toDate = Carbon::parse($request->to_date)->toDateString();
            
            $query->whereHas('attendance', function ($q) use ($fromDate, $toDate) {
                $q->whereBetween('date', [$fromDate, $toDate]);
            });
        }
        
        // Filtrer par type d'action
        if ($request->has('action_type')) {
            $query->where('action_type', $request->action_type);
        }
        
        // Trier par date et heure de création
        $activities = $query->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return response()->json([
            'success' => true,
            'activities' => $activities
        ]);
    }
}