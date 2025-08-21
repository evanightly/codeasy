<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::table('learning_material_question_test_cases', function (Blueprint $table) {
            $table->json('cognitive_levels')->nullable()->after('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::table('learning_material_question_test_cases', function (Blueprint $table) {
            $table->dropColumn('cognitive_levels');
        });
    }
};
