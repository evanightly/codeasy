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
            $table->integer('compile_count')->default(0);
            $table->boolean('compile_status')->default(false);
            $table->string('output_image')->nullable();
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
