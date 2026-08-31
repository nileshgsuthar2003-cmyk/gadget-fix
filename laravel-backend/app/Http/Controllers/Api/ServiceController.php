<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    public function index()
    {
        // Return only service identification and icon, without price
        $services = Service::select(['id', 'name', 'icon'])
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success'  => true,
            'services' => $services,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        $serviceName = trim($request->name);
        $icon = $request->icon ?? 'wrench';

        // Check if service already exists
        $service = Service::where('name', $serviceName)->first();

        if ($service) {
            $service->update(['icon' => $icon]);
            return response()->json([
                'success' => true,
                'message' => "Service '{$service->name}' updated successfully.",
                'service' => [
                    'id'   => $service->id,
                    'name' => $service->name,
                    'icon' => $service->icon,
                ],
            ], 200);
        }

        $service = Service::create([
            'name' => $serviceName,
            'icon' => $icon,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Service '{$service->name}' added successfully.",
            'service' => [
                'id'   => $service->id,
                'name' => $service->name,
                'icon' => $service->icon,
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['success' => false, 'error' => 'Service not found.'], 404);
        }

        $service->update($request->only(['name', 'icon']));

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully.',
            'service' => [
                'id'   => $service->id,
                'name' => $service->name,
                'icon' => $service->icon,
            ],
        ], 200);
    }

    public function destroy($id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['success' => false, 'error' => 'Service not found.'], 404);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully.',
        ], 200);
    }
}
