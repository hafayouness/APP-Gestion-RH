<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Référence à l'utilisateur
            $table->string('type'); // Type de contrat (CDI, CDD, Stage...)
            $table->integer('duration'); // Durée du contrat en mois
            $table->date('start_date'); // Date de début
            $table->date('end_date'); // Date de fin
            $table->string('document')->nullable();// Document contractuel (PDF, DOCX...)
            $table->text('details')->nullable();
            $table->timestamps();

            // Clé étrangère vers la table users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contracts');
    }
};
