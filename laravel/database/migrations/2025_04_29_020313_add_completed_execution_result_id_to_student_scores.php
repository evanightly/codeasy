<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::table('student_scores', function (Blueprint $table) {
            $table->foreignId('completed_execution_result_id')->nullable()->after('compile_count')->constrained('execution_results')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::table('student_scores', function (Blueprint $table) {
            $table->dropForeign(['completed_execution_result_id']);
            $table->dropColumn('completed_execution_result_id');
        });
    }
};
