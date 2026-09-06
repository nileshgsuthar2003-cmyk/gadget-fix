<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('used_phones', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->string('storage')->default('128 GB');
            $table->string('color')->default('Black');
            $table->enum('condition', ['Superb', 'Good', 'Fair'])->default('Good');
            $table->integer('battery_health')->default(90);
            $table->decimal('original_price', 10, 2)->default(0);
            $table->decimal('price', 10, 2)->default(0);
            $table->string('warranty')->default('6 Months Cell Care Warranty');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('used_phones');
    }
};
