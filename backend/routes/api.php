<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get("/hello", function () {
    return response()->json(["message" => "hello world"]);
});

Route::post('register', [RegisterController::class, 'register']);
Route::post('login', [LoginController::class, 'login']);

Route::post('/password/email', [PasswordResetController::class, 'sendResetLink'])->name('password.email');
Route::post('/password/reset', [PasswordResetController::class, 'reset'])->name('password.update');


Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', ['token' => $token]);
})->name('password.reset');
Route::get('/password/debug', [PasswordResetController::class, 'debugReset']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/profile/{userId}', [ProfileController::class, 'show']);
    Route::put('/profile/{userId}/update', [ProfileController::class, 'updateProfile']);
    Route::delete('/profile/{userId}', [ProfileController::class, 'destroy'])->name('users.destroy');
    Route::get('/user', [UserController::class, 'getAuthenticatedUser']);
    Route::post('/profile/ajouterProfile', [ProfileController::class, 'store']);
});
Route::get('/users', [UserController::class, 'index']);
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contract', [ContractController::class, 'store']);
    Route::put('/contract/{id}/update', [ContractController::class, 'update']);
    Route::delete('/contract/{id}', [ContractController::class, 'delete']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    
    // Routes d'API pour les actions de présence
    Route::prefix('/attendance')->group(function () {
        Route::post('/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.check-in');
        Route::post('/start-pause', [AttendanceController::class, 'startPause'])->name('attendance.start-pause');
        Route::post('/end-pause', [AttendanceController::class, 'endPause'])->name('attendance.end-pause');
        Route::post('/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.check-out');
        Route::post('/compensate', [AttendanceController::class, 'compensate'])->name('attendance.compensate');
        Route::get('/stats', [AttendanceController::class, 'stats'])->name('attendance.stats');
        
        // Nouvelles routes pour l'historique
        Route::get('/history', [AttendanceController::class, 'history'])->name('attendance.history');
        Route::get('/user-activity', [AttendanceController::class, 'userActivity'])
            ->name('attendance.user-activity')
            ->middleware('can:manage-users');
    });
});



