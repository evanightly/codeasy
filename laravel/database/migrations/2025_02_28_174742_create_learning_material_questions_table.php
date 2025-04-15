<?php

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('learning_material_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_material_id')
                ->constrained()
            ->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('file')->nullable();
            $table->string('file_extension')->nullable();
            $table->enum('type', LearningMaterialTypeEnum::toArray());
            $table->integer('order_number');
            $table->text('clue')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('learning_material_questions');
    }
};
