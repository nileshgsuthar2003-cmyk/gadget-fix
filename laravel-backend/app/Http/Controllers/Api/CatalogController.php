<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\DeviceModel;
use App\Models\ModelService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CatalogController extends Controller
{
    // ==========================================
    // 1. BRAND MANAGEMENT
    // ==========================================
    public function getBrands()
    {
        $brands = Brand::withCount('models')->orderBy('name', 'asc')->get();
        return response()->json([
            'success' => true,
            'brands'  => $brands,
        ], 200);
    }

    public function storeBrand(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:brands,name|max:100',
            'logo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $brand = Brand::create([
            'name' => trim($request->name),
            'logo' => $request->logo,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Brand '{$brand->name}' created successfully.",
            'brand'   => $brand,
        ], 201);
    }

    public function updateBrand(Request $request, $id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return response()->json(['success' => false, 'error' => 'Brand not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:brands,name,' . $id,
            'logo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $brand->update([
            'name' => trim($request->name),
            'logo' => $request->logo,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Brand '{$brand->name}' updated successfully.",
            'brand'   => $brand->loadCount('models'),
        ], 200);
    }

    public function deleteBrand($id)
    {
        $brand = Brand::find($id);
        if (!$brand) {
            return response()->json(['success' => false, 'error' => 'Brand not found'], 404);
        }
        $brand->delete();

        return response()->json(['success' => true, 'message' => 'Brand deleted successfully.']);
    }

    // ==========================================
    // 2. MODEL MANAGEMENT
    // ==========================================
    public function getModels($brandId)
    {
        $models = DeviceModel::where('brand_id', $brandId)
            ->withCount('services')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'models'  => $models,
        ], 200);
    }

    public function storeModel(Request $request, $brandId)
    {
        $brand = Brand::find($brandId);
        if (!$brand) {
            return response()->json(['success' => false, 'error' => 'Brand not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $model = DeviceModel::create([
            'brand_id' => $brand->id,
            'name'     => trim($request->name),
            'image'    => $request->image,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Model '{$model->name}' added under {$brand->name}.",
            'model'   => $model,
        ], 201);
    }

    public function updateModel(Request $request, $id)
    {
        $model = DeviceModel::find($id);
        if (!$model) {
            return response()->json(['success' => false, 'error' => 'Model not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $model->update([
            'name'  => trim($request->name),
            'image' => $request->image,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Model '{$model->name}' updated successfully.",
            'model'   => $model->loadCount('services'),
        ], 200);
    }

    public function deleteModel($id)
    {
        $model = DeviceModel::find($id);
        if (!$model) {
            return response()->json(['success' => false, 'error' => 'Model not found'], 404);
        }
        $model->delete();

        return response()->json(['success' => true, 'message' => 'Model deleted successfully.']);
    }

    // ==========================================
    // 3. MODEL SERVICES & CUSTOM PRICING MATRIX
    // ==========================================
    public function getModelServices($modelId)
    {
        $services = ModelService::where('device_model_id', $modelId)
            ->orderBy('price', 'desc')
            ->get();

        return response()->json([
            'success'  => true,
            'services' => $services,
        ], 200);
    }

    public function storeModelService(Request $request, $modelId)
    {
        $model = DeviceModel::find($modelId);
        if (!$model) {
            return response()->json(['success' => false, 'error' => 'Device model not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'service_name' => 'required|string|max:255',
            'price'        => 'required|numeric|min:0',
            'warranty'     => 'nullable|string',
            'category'     => 'nullable|string',
            'part_quality' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $modelService = ModelService::create([
            'device_model_id' => $model->id,
            'service_name'    => trim($request->service_name),
            'category'        => $request->category ?? 'Hardware',
            'price'           => $request->price,
            'warranty'        => $request->warranty ?? '6 Months',
            'part_quality'    => $request->part_quality ?? 'OEM Original',
        ]);

        return response()->json([
            'success'       => true,
            'message'       => "Service '{$modelService->service_name}' added with price ₹{$modelService->price}.",
            'model_service' => $modelService,
        ], 201);
    }

    public function updateModelService(Request $request, $id)
    {
        $service = ModelService::find($id);
        if (!$service) {
            return response()->json(['success' => false, 'error' => 'Service not found'], 404);
        }

        $service->update($request->only(['service_name', 'price', 'warranty', 'category', 'part_quality']));

        return response()->json([
            'success'       => true,
            'message'       => 'Service pricing updated successfully.',
            'model_service' => $service,
        ], 200);
    }

    public function deleteModelService($id)
    {
        $service = ModelService::find($id);
        if (!$service) {
            return response()->json(['success' => false, 'error' => 'Service not found'], 404);
        }
        $service->delete();

        return response()->json(['success' => true, 'message' => 'Service removed from model.']);
    }
}
