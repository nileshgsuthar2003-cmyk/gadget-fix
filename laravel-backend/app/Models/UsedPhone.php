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
        'images',
        'is_active',
    ];

    protected $casts = [
        'battery_health' => 'integer',
        'original_price' => 'decimal:2',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'images' => 'array',
    ];

    public function buyRequests()
    {
        return $this->hasMany(PhoneBuyRequest::class);
    }
}
