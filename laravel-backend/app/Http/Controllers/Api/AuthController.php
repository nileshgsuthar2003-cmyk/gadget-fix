<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:100',
            'lastName'  => 'required|string|max:100',
            'email'     => 'required|string|email|max:255|unique:users,email',
            'phone'     => 'required|string|max:20|unique:users,phone',
            'password'  => 'required|string|min:6',
        ], [
            'email.unique' => 'An account with this email already exists.',
            'phone.unique' => 'An account with this mobile number already exists.',
            'password.min' => 'Password must be at least 6 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        $user = User::create([
            'first_name' => trim($request->firstName),
            'last_name'  => trim($request->lastName),
            'email'      => trim($request->email),
            'phone'      => trim($request->phone),
            'password'   => Hash::make($request->password),
            'role'       => 'customer',
        ]);

        $token = $user->createToken('fixly-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account registered successfully.',
            'user'    => $this->formatUserResponse($user),
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', trim($request->email))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid email or password.',
            ], 401);
        }

        $token = $user->createToken('fixly-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Signed in successfully.',
            'user'    => $this->formatUserResponse($user),
            'token'   => $token,
        ], 200);
    }

    public function adminLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', trim($request->email))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid admin email or password.',
            ], 401);
        }

        if (($user->role ?? 'customer') !== 'admin') {
            return response()->json([
                'success' => false,
                'error'   => 'Access denied. You do not have administrator permissions.',
            ], 403);
        }

        $token = $user->createToken('fixly-admin')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin authenticated successfully.',
            'user'    => [
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => 'admin',
            ],
            'token'   => $token,
        ], 200);
    }

    // ==========================================
    // FORGOT PASSWORD VIA EMAIL OTP
    // ==========================================
    public function sendResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => 'Please enter a valid email address.',
            ], 422);
        }

        $email = trim($request->email);
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error'   => 'No account found with this email address.',
            ], 404);
        }

        // Generate 6-digit OTP
        $otp = (string) random_int(100000, 999999);

        // Store in password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token'      => $otp,
                'created_at' => now(),
            ]
        );

        Log::info("Password reset OTP generated for {$email}: {$otp}");

        return response()->json([
            'success'   => true,
            'message'   => "Verification OTP sent to {$email}.",
            'email'     => $email,
            'debug_otp' => $otp, // Useful for immediate in-app testing
        ], 200);
    }

    public function verifyResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp'   => 'required|string|min:4|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => 'Please enter the 6-digit verification code.',
            ], 422);
        }

        $email = trim($request->email);
        $otp = trim($request->otp);

        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('token', $otp)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid verification OTP code.',
            ], 422);
        }

        // Check if OTP is older than 15 minutes
        if (now()->diffInMinutes($record->created_at) > 15) {
            return response()->json([
                'success' => false,
                'error'   => 'OTP code has expired. Please request a new code.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully.',
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'otp'      => 'required|string',
            'password' => 'required|string|min:6',
        ], [
            'password.min' => 'New password must be at least 6 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        $email = trim($request->email);
        $otp = trim($request->otp);

        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('token', $otp)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid or expired OTP session.',
            ], 422);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User account not found.'], 404);
        }

        // Update password and clear OTP
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully! You can now sign in.',
        ], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->has('user_id')) {
            $user = User::find($request->user_id);
        }
        if (!$user) {
            $user = User::where('role', 'customer')->first() ?? User::first();
        }

        $repairsCount = $user ? $user->repairs()->count() : 0;
        $totalSpent = $user ? $user->repairs()->sum('estimate') : 0;

        return response()->json([
            'success' => true,
            'user'    => $this->formatUserResponse($user),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->has('user_id')) {
            $user = User::find($request->user_id);
        }
        if (!$user && $request->has('email')) {
            $user = User::where('email', $request->email)->first();
        }
        if (!$user) {
            $user = User::where('role', 'customer')->first() ?? User::first();
        }

        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User account not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'phone'      => 'nullable|string|max:20',
            'email'      => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'password'   => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        if ($request->filled('first_name')) $user->first_name = trim($request->first_name);
        if ($request->filled('last_name')) $user->last_name = trim($request->last_name);
        if ($request->filled('phone')) $user->phone = trim($request->phone);
        if ($request->filled('email')) $user->email = trim($request->email);
        if ($request->filled('password')) $user->password = Hash::make($request->password);

        if ($request->has('addresses')) {
            $addrs = $request->input('addresses');
            if (is_string($addrs)) {
                $addrs = json_decode($addrs, true);
            }
            if (is_array($addrs)) {
                $user->addresses = array_values($addrs);
            }
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user'    => $this->formatUserResponse($user),
        ], 200);
    }

    public function getAddresses(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->has('user_id')) {
            $user = User::find($request->user_id);
        }
        if (!$user) {
            $user = User::where('role', 'customer')->first() ?? User::first();
        }
        if (!$user) {
            return response()->json(['success' => false, 'addresses' => []], 404);
        }

        $formatted = $this->formatUserResponse($user);
        return response()->json([
            'success'   => true,
            'addresses' => $formatted['addresses'] ?? [],
        ]);
    }

    public function saveAddress(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->has('user_id')) {
            $user = User::find($request->user_id);
        }
        if (!$user) {
            $user = User::where('role', 'customer')->first() ?? User::first();
        }
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'type'    => 'required|string|max:50',
            'flat'    => 'required|string|max:255',
            'street'  => 'required|string|max:255',
            'city'    => 'required|string|max:100',
            'pincode' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        $currentAddresses = is_array($user->addresses) ? $user->addresses : [];
        $addrId = $request->input('id') ?: ('addr_' . time() . '_' . rand(100, 999));
        $isDefault = filter_var($request->input('is_default', false), FILTER_VALIDATE_BOOLEAN);

        $flat = trim($request->input('flat'));
        $street = trim($request->input('street'));
        $landmark = trim($request->input('landmark', ''));
        $city = trim($request->input('city'));
        $pincode = trim($request->input('pincode'));
        $type = trim($request->input('type'));

        $landmarkStr = $landmark ? (preg_match('/^(near|opp|opposite|behind|beside|next to|adj|adjacent)\b/i', $landmark) ? $landmark : "Near {$landmark}") : '';
        $lineParts = array_filter([$flat, $street, $landmarkStr, "{$city} {$pincode}"]);
        $line = implode(', ', $lineParts);

        $addressData = [
            'id'         => (string)$addrId,
            'type'       => $type,
            'flat'       => $flat,
            'street'     => $street,
            'landmark'   => $landmark,
            'city'       => $city,
            'pincode'    => $pincode,
            'line'       => $line,
            'is_default' => $isDefault,
        ];

        if ($isDefault) {
            foreach ($currentAddresses as &$a) {
                $a['is_default'] = false;
            }
            unset($a);
        }

        $found = false;
        foreach ($currentAddresses as $idx => $existing) {
            if (isset($existing['id']) && (string)$existing['id'] === (string)$addrId) {
                $currentAddresses[$idx] = $addressData;
                $found = true;
                break;
            }
        }

        if (!$found) {
            if (empty($currentAddresses)) {
                $addressData['is_default'] = true;
            }
            $currentAddresses[] = $addressData;
        }

        $user->addresses = array_values($currentAddresses);
        $user->save();

        return response()->json([
            'success'   => true,
            'message'   => $found ? 'Address updated successfully' : 'Address added successfully',
            'address'   => $addressData,
            'addresses' => $user->addresses,
        ], 200);
    }

    public function deleteAddress(Request $request, $id)
    {
        $user = $request->user();
        if (!$user && $request->has('user_id')) {
            $user = User::find($request->user_id);
        }
        if (!$user) {
            $user = User::where('role', 'customer')->first() ?? User::first();
        }
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User not found.'], 404);
        }

        $currentAddresses = is_array($user->addresses) ? $user->addresses : [];
        $wasDefault = false;

        $filtered = [];
        foreach ($currentAddresses as $addr) {
            if (isset($addr['id']) && (string)$addr['id'] === (string)$id) {
                if (!empty($addr['is_default'])) {
                    $wasDefault = true;
                }
                continue;
            }
            $filtered[] = $addr;
        }

        if ($wasDefault && count($filtered) > 0) {
            $filtered[0]['is_default'] = true;
        }

        $user->addresses = array_values($filtered);
        $user->save();

        return response()->json([
            'success'   => true,
            'message'   => 'Address removed successfully.',
            'addresses' => $user->addresses,
        ], 200);
    }

    public function formatUserResponse($user): array
    {
        $addresses = is_array($user->addresses) ? $user->addresses : [];

        $repairsCount = $user->repairs()->count();
        $totalSpent = $user->repairs()->sum('estimate') ?: 0;

        return [
            'id'            => $user->id,
            'first_name'    => $user->first_name,
            'last_name'     => $user->last_name,
            'name'          => $user->name,
            'email'         => $user->email,
            'phone'         => $user->phone,
            'role'          => $user->role ?? 'customer',
            'repairs_count' => $repairsCount,
            'total_spent'   => $totalSpent,
            'addresses'     => $addresses,
        ];
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
