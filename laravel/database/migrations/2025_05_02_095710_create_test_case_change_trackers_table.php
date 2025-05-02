<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('test_case_change_trackers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_case_id')->constrained('learning_material_question_test_cases')->onDelete('cascade');
            $table->foreignId('learning_material_question_id')->constrained()->onDelete('cascade');
            $table->foreignId('learning_material_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('change_type');
            $table->json('previous_data')->nullable();
            $table->json('affected_student_ids');
            $table->string('status');
            $table->timestamp('scheduled_at');
            $table->timestamp('completed_at')->nullable();
            $table->json('execution_details')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('test_case_change_trackers');
    }
};
