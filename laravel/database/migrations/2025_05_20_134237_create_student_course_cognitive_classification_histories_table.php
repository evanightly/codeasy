<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('student_course_cognitive_classification_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete()
                ->name('scc_histories_course_fk');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()
                ->name('scc_histories_user_fk');
            $table->foreignId('student_course_cognitive_classification_id')
                ->constrained('student_course_cognitive_classifications')
                ->cascadeOnDelete()
                ->name('scc_histories_classification_fk');
            $table->string('classification_type');
            $table->string('classification_level');
            $table->decimal('classification_score');
            $table->json('raw_data');
            $table->datetime('classified_at');
            $table->timestamps();

            // Add index on fields commonly used for querying
            $table->index(['user_id', 'course_id', 'classified_at'], 'scc_histories_query_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('student_course_cognitive_classification_histories');
    }
};
