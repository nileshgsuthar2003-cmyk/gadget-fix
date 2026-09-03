<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            if (!Schema::hasColumn('repairs', 'photos')) {
                $table->json('photos')->nullable()->after('problem');
            }
            if (!Schema::hasColumn('repairs', 'description')) {
                $table->text('description')->nullable()->after('problem');
            }
            if (!Schema::hasColumn('repairs', 'time_slot')) {
                $table->string('time_slot')->nullable()->after('appointment_date');
            }
            if (!Schema::hasColumn('repairs', 'address')) {
                $table->text('address')->nullable()->after('method');
            }
            if (!Schema::hasColumn('repairs', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('repairs', 'customer_phone')) {
                $table->string('customer_phone')->nullable()->after('customer_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            $table->dropColumn(['photos', 'description', 'time_slot', 'address', 'customer_name', 'customer_phone']);
        });
    }
};
