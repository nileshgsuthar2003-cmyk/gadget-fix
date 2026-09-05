<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhoneBuyRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'used_phone_id',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'address',
        'payment_method',
        'status',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'float',
    ];

    public function usedPhone()
    {
        return $this->belongsTo(UsedPhone::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
