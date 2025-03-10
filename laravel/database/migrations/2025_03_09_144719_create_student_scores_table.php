<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('student_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('learning_material_question_id')->constrained()->onDelete('cascade');
            $table->integer('coding_time')->default(0); // Time in seconds
            $table->integer('score')->default(0); // Score out of 100
            $table->boolean('completion_status')->default(false); // Whether the question is completed
            $table->boolean('trial_status')->default(false); // Whether the student has attempted the question
            $table->integer('compile_count')->default(0); // Number of times the student has compiled the code
            $table->timestamps();

            // Unique constraint to ensure one score per user per question
            $table->unique(['user_id', 'learning_material_question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('student_scores');
    }
};
