<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('student_cognitive_classifications', function (Blueprint $table) {
            $table->id();
            // $table->bigInteger('user_id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // $table->bigInteger('course_id');
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('classification_type');
            $table->string('classification_level');
            $table->decimal('classification_score');
            $table->json('raw_data');
            $table->timestamp('classified_at');
            $table->timestamps();

            $table->unique(['user_id', 'course_id', 'classification_type'], 'unique_student_classification');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('student_cognitive_classifications');
    }
};
