<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('execution_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_score_id')->constrained()->onDelete('cascade');
            $table->text('code');
            $table->boolean('compile_status')->default(false);
            $table->string('output_image')->nullable();
            $table->integer('variable_count')->default(0); // Count of declared variables
            $table->integer('function_count')->default(0); // Count of declared functions
            $table->integer('test_case_complete_count')->default(0); // Number of test cases completed
            $table->integer('test_case_total_count')->default(0); // Total number of test cases
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('execution_results');
    }
};
