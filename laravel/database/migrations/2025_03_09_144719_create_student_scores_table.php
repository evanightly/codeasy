<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        // protected $fillable = ['user_id', 'learning_material_question_id', 'score', 'completion_status', 'trial_status'];

        Schema::create('student_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('learning_material_question_id')->constrained()->onDelete('cascade');
            $table->integer('coding_time')->default(0);
            $table->integer('score')->default(0);
            $table->boolean('completion_status')->default(false);
            $table->boolean('trial_status')->default(false);
            $table->unique(['user_id', 'learning_material_question_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('student_scores');
    }
};
