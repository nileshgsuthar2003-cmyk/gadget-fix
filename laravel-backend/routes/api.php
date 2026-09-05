<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RepairController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\UsedPhoneController;

/*
|--------------------------------------------------------------------------
| Fixly API Routes
|--------------------------------------------------------------------------
*/

// Public File & Photo Upload Endpoint (Stores in public/uploads)
Route::post('/upload', [UploadController::class, 'upload']);

// Public Promotional Banners (For Mobile App & Web Home)
Route::get('/banners', [BannerController::class, 'index']);

// Public Auth Endpoints
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/admin-login', [AuthController::class, 'adminLogin']);
Route::get('/auth/me', [AuthController::class, 'me']);
Route::post('/auth/profile', [AuthController::class, 'updateProfile']);
Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

// User Saved Addresses Endpoints
Route::get('/user/addresses', [AuthController::class, 'getAddresses']);
Route::post('/user/addresses', [AuthController::class, 'saveAddress']);
Route::delete('/user/addresses/{id}', [AuthController::class, 'deleteAddress']);

// Email OTP Forgot Password Endpoints
Route::post('/auth/forgot-password/send-otp', [AuthController::class, 'sendResetOtp']);
Route::post('/auth/forgot-password/verify-otp', [AuthController::class, 'verifyResetOtp']);
Route::post('/auth/forgot-password/reset', [AuthController::class, 'resetPassword']);

// Public Services
Route::get('/services', [ServiceController::class, 'index']);
Route::post('/services', [ServiceController::class, 'store']);
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
Route::delete('/admin/repairs/{id}', [RepairController::class, 'destroy']);
Route::get('/admin/customers', [RepairController::class, 'adminCustomers']);
Route::get('/admin/users', [UserController::class, 'index']);
Route::post('/admin/users', [UserController::class, 'store']);
Route::put('/admin/users/{id}', [UserController::class, 'update']);
Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);

// Admin Banners Management
Route::get('/admin/banners', [BannerController::class, 'adminIndex']);
Route::post('/admin/banners', [BannerController::class, 'store']);
Route::put('/admin/banners/{id}', [BannerController::class, 'update']);
Route::delete('/admin/banners/{id}', [BannerController::class, 'destroy']);

// Public & Customer Repairs Endpoints
Route::get('/repairs', [RepairController::class, 'index']);
Route::post('/repairs', [RepairController::class, 'store']);
Route::get('/repairs/{id}', [RepairController::class, 'show']);
Route::delete('/repairs/{id}', [RepairController::class, 'destroy']);

// Protected Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

// ==========================================
// Used / Refurbished Phones Marketplace
// ==========================================
Route::get('/used-phones', [UsedPhoneController::class, 'index']);
Route::post('/used-phones/{id}/buy', [UsedPhoneController::class, 'submitBuyRequest']);

// Admin Used Phones Management
Route::get('/admin/used-phones', [UsedPhoneController::class, 'adminIndex']);
Route::post('/admin/used-phones', [UsedPhoneController::class, 'store']);
Route::put('/admin/used-phones/{id}', [UsedPhoneController::class, 'update']);
Route::delete('/admin/used-phones/{id}', [UsedPhoneController::class, 'destroy']);

// Admin Phone Buy Requests
Route::get('/admin/phone-buy-requests', [UsedPhoneController::class, 'buyRequests']);
Route::put('/admin/phone-buy-requests/{id}/status', [UsedPhoneController::class, 'updateBuyRequestStatus']);

