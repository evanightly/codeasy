<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('execution_results', function (Blueprint $table) {
            $table->json('achieved_test_case_ids')->nullable()->after('test_case_total_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('execution_results', function (Blueprint $table) {
            $table->dropColumn('achieved_test_case_ids');
        });
    }
};
