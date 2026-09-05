<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            if (!Schema::hasColumn('repairs', 'extra_charges')) {
                $table->decimal('extra_charges', 10, 2)->default(0)->after('estimate');
            }
            if (!Schema::hasColumn('repairs', 'extra_charges_note')) {
                $table->string('extra_charges_note')->nullable()->after('extra_charges');
            }
        });
    }

    public function down(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            $table->dropColumn(['extra_charges', 'extra_charges_note']);
        });
    }
};
