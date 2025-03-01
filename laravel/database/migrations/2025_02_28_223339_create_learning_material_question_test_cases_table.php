<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('learning_material_question_test_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_material_question_id')
                ->constrained()
                ->name('fk_test_cases_question_id');
            // ->onDelete('cascade');
            $table->text('input')->nullable();
            $table->text('expected_output_file')->nullable();
            $table->string('expected_output_file_extension')->nullable();
            $table->text('description')->nullable();
            $table->boolean('hidden')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('learning_material_question_test_cases');
    }
};
