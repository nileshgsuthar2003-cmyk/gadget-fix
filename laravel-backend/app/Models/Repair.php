<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Repair extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'customer_name',
        'customer_phone',
        'device',
        'service',
        'problem',
        'description',
        'photos',
        'status',
        'estimate',
        'appointment_date',
        'time_slot',
        'method',
        'address',
        'payment_status',
    ];

    protected $casts = [
        'photos' => 'array',
        'estimate' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
