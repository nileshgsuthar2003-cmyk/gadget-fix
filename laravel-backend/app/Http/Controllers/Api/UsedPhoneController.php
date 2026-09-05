<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsedPhone;
use App\Models\PhoneBuyRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UsedPhoneController extends Controller
{
    /**
     * GET /api/used-phones
     * Public: List all active used phone listings.
     */
    public function index()
    {
        $phones = UsedPhone::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'phones' => $phones,
        ]);
    }

    /**
     * GET /api/admin/used-phones
     * Admin: List ALL phone listings (including inactive).
     */
    public function adminIndex()
    {
        $phones = UsedPhone::withCount('buyRequests')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'phones' => $phones,
        ]);
    }

    /**
     * POST /api/admin/used-phones
     * Admin: Add a new used phone listing.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:150',
            'storage' => 'sometimes|string|max:50',
            'color' => 'sometimes|string|max:50',
            'condition' => 'sometimes|in:Superb,Good,Fair',
            'battery_health' => 'sometimes|integer|min:0|max:100',
            'original_price' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'warranty' => 'sometimes|string|max:200',
            'description' => 'sometimes|nullable|string',
            'image_url' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $phone = UsedPhone::create($request->only([
            'brand', 'model', 'storage', 'color', 'condition',
            'battery_health', 'original_price', 'price', 'warranty',
            'description', 'image_url',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Used phone listing created successfully.',
            'phone' => $phone,
        ], 201);
    }

    /**
     * PUT /api/admin/used-phones/{id}
     * Admin: Update a used phone listing.
     */
    public function update(Request $request, $id)
    {
        $phone = UsedPhone::find($id);

        if (!$phone) {
            return response()->json([
                'success' => false,
                'error' => 'Used phone listing not found.',
            ], 404);
        }

        $phone->update($request->only([
            'brand', 'model', 'storage', 'color', 'condition',
            'battery_health', 'original_price', 'price', 'warranty',
            'description', 'image_url', 'is_active',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Listing updated successfully.',
            'phone' => $phone->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/used-phones/{id}
     * Admin: Remove a used phone listing.
     */
    public function destroy($id)
    {
        $phone = UsedPhone::find($id);

        if (!$phone) {
            return response()->json([
                'success' => false,
                'error' => 'Listing not found.',
            ], 404);
        }

        $phone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Listing deleted successfully.',
        ]);
    }

    // =====================================================
    //  Buy Requests
    // =====================================================

    /**
     * POST /api/used-phones/{id}/buy
     * Customer: Submit a buy request for a used phone.
     */
    public function submitBuyRequest(Request $request, $id)
    {
        $phone = UsedPhone::find($id);

        if (!$phone || !$phone->is_active) {
            return response()->json([
                'success' => false,
                'error' => 'This phone listing is no longer available.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'sometimes|nullable|string|max:20',
            'customer_email' => 'sometimes|nullable|email|max:150',
            'address' => 'sometimes|nullable|string',
            'payment_method' => 'sometimes|in:upi,cod,card',
            'user_id' => 'sometimes|nullable|integer',
            'notes' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $buyRequest = PhoneBuyRequest::create([
            'used_phone_id' => $phone->id,
            'user_id' => $request->input('user_id'),
            'customer_name' => $request->input('customer_name'),
            'customer_phone' => $request->input('customer_phone'),
            'customer_email' => $request->input('customer_email'),
            'address' => $request->input('address'),
            'payment_method' => $request->input('payment_method', 'upi'),
            'total_amount' => $phone->price,
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Buy request submitted successfully! We will contact you shortly.',
            'request' => $buyRequest->load('usedPhone'),
        ], 201);
    }

    /**
     * GET /api/admin/phone-buy-requests
     * Admin: View all buy requests.
     */
    public function buyRequests()
    {
        $requests = PhoneBuyRequest::with('usedPhone', 'user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }

    /**
     * PUT /api/admin/phone-buy-requests/{id}/status
     * Admin: Update buy request status.
     */
    public function updateBuyRequestStatus(Request $request, $id)
    {
        $buyRequest = PhoneBuyRequest::find($id);

        if (!$buyRequest) {
            return response()->json([
                'success' => false,
                'error' => 'Buy request not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $buyRequest->update(['status' => $request->input('status')]);

        return response()->json([
            'success' => true,
            'message' => 'Buy request status updated.',
            'request' => $buyRequest->fresh()->load('usedPhone'),
        ]);
    }
}
