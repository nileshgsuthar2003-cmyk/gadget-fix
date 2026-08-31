<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'name',
        'image',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function services()
    {
        return $this->hasMany(ModelService::class);
    }
}
