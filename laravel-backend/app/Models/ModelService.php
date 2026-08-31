<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModelService extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_model_id',
        'service_name',
        'category',
        'price',
        'warranty',
        'part_quality',
    ];

    public function deviceModel()
    {
        return $this->belongsTo(DeviceModel::class);
    }
}
