<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repairs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('device');
            $table->string('service');
            $table->text('problem')->nullable();
            $table->string('status')->default('Pending');
            $table->decimal('estimate', 10, 2);
            $table->dateTime('appointment_date')->nullable();
            $table->string('method')->nullable();
            $table->string('payment_status')->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repairs');
    }
};
