<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->decimal('starting_price', 10, 2)->nullable()->default(0);
            $table->string('icon')->default('smartphone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
