<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount('repairs');

        if ($request->has('search') && !empty($request->search)) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('id', 'desc')->get()->map(function ($user) {
            $spent = $user->repairs()->sum('estimate') ?: 0;
            $lastRepair = $user->repairs()->latest()->first();

            return [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'role'          => $user->role ?? 'customer',
                'repairs_count' => $user->repairs_count,
                'spent'         => (float) $spent,
                'last_repair'   => $lastRepair ? $lastRepair->created_at->format('d M Y') : 'No repairs yet',
                'created_at'    => $user->created_at ? $user->created_at->format('d M Y') : 'Recent',
            ];
        });

        $stats = [
            'total_users'     => User::count(),
            'customers_count' => User::where('role', 'customer')->orWhereNull('role')->count(),
            'admins_count'    => User::where('role', 'admin')->count(),
        ];

        return response()->json([
            'success' => true,
            'users'   => $users,
            'stats'   => $stats,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'phone'      => 'required|string|max:20|unique:users,phone',
            'password'   => 'required|string|min:6',
            'role'       => 'nullable|string|in:customer,admin,technician',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        $user = User::create([
            'first_name' => trim($request->first_name),
            'last_name'  => trim($request->last_name ?? ''),
            'email'      => trim($request->email),
            'phone'      => trim($request->phone),
            'password'   => Hash::make($request->password),
            'role'       => $request->role ?? 'customer',
        ]);

        return response()->json([
            'success' => true,
            'message' => "User '{$user->name}' created successfully.",
            'user'    => [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'role'          => $user->role,
                'repairs_count' => 0,
                'spent'         => 0,
                'created_at'    => date('d M Y'),
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:100',
            'last_name'  => 'nullable|string|max:100',
            'email'      => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'phone'      => 'nullable|string|max:20|unique:users,phone,' . $user->id,
            'password'   => 'nullable|string|min:6',
            'role'       => 'nullable|string|in:customer,admin,technician',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => $validator->errors()->first(),
            ], 422);
        }

        if ($request->filled('first_name')) $user->first_name = trim($request->first_name);
        if ($request->filled('last_name')) $user->last_name = trim($request->last_name);
        if ($request->filled('email')) $user->email = trim($request->email);
        if ($request->filled('phone')) $user->phone = trim($request->phone);
        if ($request->filled('role')) $user->role = $request->role;
        if ($request->filled('password')) $user->password = Hash::make($request->password);

        $user->save();

        return response()->json([
            'success' => true,
            'message' => "User '{$user->name}' updated successfully.",
            'user'    => [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'name'          => $user->name,
                'email'         => $user->email,
                'phone'         => $user->phone,
                'role'          => $user->role,
                'repairs_count' => $user->repairs()->count(),
                'spent'         => (float) ($user->repairs()->sum('estimate') ?: 0),
                'created_at'    => $user->created_at ? $user->created_at->format('d M Y') : 'Recent',
            ],
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'error' => 'User not found.'], 404);
        }

        if ($user->email === 'admin@gmail.com' || $user->email === 'admin@cellcare.com') {
            return response()->json(['success' => false, 'error' => 'Super Admin account cannot be deleted.'], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ], 200);
    }
}
