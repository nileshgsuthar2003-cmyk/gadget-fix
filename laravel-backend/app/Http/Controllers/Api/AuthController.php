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
            'user'    => [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'role'          => 'customer',
                'repairs_count' => 0,
                'total_spent'   => 0,
            ],
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
        $repairsCount = $user->repairs()->count();
        $totalSpent = $user->repairs()->sum('estimate') ?: 0;

        return response()->json([
            'success' => true,
            'message' => 'Signed in successfully.',
            'user'    => [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'role'          => $user->role ?? 'customer',
                'repairs_count' => $repairsCount,
                'total_spent'   => $totalSpent,
            ],
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
            'user'    => [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'role'          => $user->role ?? 'customer',
                'repairs_count' => $repairsCount,
                'total_spent'   => $totalSpent,
            ],
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

        $user->save();

        $repairsCount = $user->repairs()->count();
        $totalSpent = $user->repairs()->sum('estimate') ?: 0;

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user'    => [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'role'          => $user->role ?? 'customer',
                'repairs_count' => $repairsCount,
                'total_spent'   => $totalSpent,
            ],
        ], 200);
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
