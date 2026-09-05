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
        'extra_charges',
        'extra_charges_note',
        'additional_charges',
        'appointment_date',
        'time_slot',
        'method',
        'address',
        'payment_status',
    ];

    protected $casts = [
        'photos' => 'array',
        'estimate' => 'float',
        'extra_charges' => 'float',
        'additional_charges' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
