<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RepairController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| Fixly API Routes
|--------------------------------------------------------------------------
*/

// Public Auth Endpoints
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/admin-login', [AuthController::class, 'adminLogin']);
Route::get('/auth/me', [AuthController::class, 'me']);
Route::post('/auth/profile', [AuthController::class, 'updateProfile']);
Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

// Email OTP Forgot Password Endpoints
Route::post('/auth/forgot-password/send-otp', [AuthController::class, 'sendResetOtp']);
Route::post('/auth/forgot-password/verify-otp', [AuthController::class, 'verifyResetOtp']);
Route::post('/auth/forgot-password/reset', [AuthController::class, 'resetPassword']);

// Admin Dynamic Users Management
Route::get('/admin/users', [UserController::class, 'index']);
Route::post('/admin/users', [UserController::class, 'store']);
Route::put('/admin/users/{id}', [UserController::class, 'update']);
Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);

// Services Endpoints (Master General Services)
Route::get('/services', [ServiceController::class, 'index']);
Route::post('/services', [ServiceController::class, 'store']);
Route::put('/services/{id}', [ServiceController::class, 'update']);
Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

// ==========================================
// Catalog Endpoints: Brands -> Models -> Model Services
// ==========================================
Route::get('/catalog/brands', [CatalogController::class, 'getBrands']);
Route::post('/catalog/brands', [CatalogController::class, 'storeBrand']);
Route::put('/catalog/brands/{id}', [CatalogController::class, 'updateBrand']);
Route::delete('/catalog/brands/{id}', [CatalogController::class, 'deleteBrand']);

Route::get('/catalog/brands/{brandId}/models', [CatalogController::class, 'getModels']);
Route::post('/catalog/brands/{brandId}/models', [CatalogController::class, 'storeModel']);
Route::put('/catalog/models/{id}', [CatalogController::class, 'updateModel']);
Route::delete('/catalog/models/{id}', [CatalogController::class, 'deleteModel']);

Route::get('/catalog/models/{modelId}/services', [CatalogController::class, 'getModelServices']);
Route::post('/catalog/models/{modelId}/services', [CatalogController::class, 'storeModelService']);
Route::put('/catalog/model-services/{id}', [CatalogController::class, 'updateModelService']);
Route::delete('/catalog/model-services/{id}', [CatalogController::class, 'deleteModelService']);

// Admin Dynamic Endpoints
Route::get('/admin/repairs', [RepairController::class, 'adminAllRepairs']);
Route::put('/admin/repairs/{id}/status', [RepairController::class, 'updateStatus']);
Route::get('/admin/customers', [RepairController::class, 'adminCustomers']);

// Public Repairs Endpoints
Route::get('/repairs/{id}', [RepairController::class, 'show']);

// Protected Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/repairs', [RepairController::class, 'index']);
    Route::post('/repairs', [RepairController::class, 'store']);
});
