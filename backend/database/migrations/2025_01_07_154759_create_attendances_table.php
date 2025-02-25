<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->time('pause_start')->nullable();
            $table->time('pause_end')->nullable();
            $table->integer('total_minutes_worked')->default(0);
            $table->integer('pause_duration_minutes')->default(0);
            $table->boolean('completed_hours')->default(false);
            $table->integer('remaining_minutes')->default(480); // 8 heures en minutes
            $table->integer('compensation_minutes')->default(0); // minutes à compenser
            $table->timestamps();
            
            $table->unique(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};