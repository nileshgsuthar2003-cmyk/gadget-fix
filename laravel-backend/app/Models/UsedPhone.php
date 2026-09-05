<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsedPhone extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'storage',
        'color',
        'condition',
        'battery_health',
        'original_price',
        'price',
        'warranty',
        'description',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'original_price' => 'float',
        'price' => 'float',
        'battery_health' => 'integer',
        'is_active' => 'boolean',
    ];

    public function buyRequests()
    {
        return $this->hasMany(PhoneBuyRequest::class);
    }
}
