<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('model_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_model_id')->constrained('device_models')->onDelete('cascade');
            $table->string('service_name');
            $table->string('category')->nullable()->default('Hardware');
            $table->decimal('price', 10, 2);
            $table->string('warranty')->nullable()->default('6 Months');
            $table->string('part_quality')->nullable()->default('OEM Original');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('model_services');
    }
};
