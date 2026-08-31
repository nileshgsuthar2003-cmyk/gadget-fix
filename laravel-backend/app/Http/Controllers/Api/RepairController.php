<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Repair;
use App\Models\User;
use Illuminate\Http\Request;

class RepairController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $repairs = Repair::where('user_id', $user ? $user->id : 1)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $repairs,
        ]);
    }

    public function adminAllRepairs()
    {
        $repairs = Repair::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalRevenue = Repair::where('payment_status', 'Paid')->orWhere('status', 'Completed')->sum('estimate');
        $activeCount = Repair::whereNotIn('status', ['Completed', 'Cancelled'])->count();
        $completedCount = Repair::where('status', 'Completed')->count();

        return response()->json([
            'success' => true,
            'repairs' => $repairs,
            'stats'   => [
                'total_revenue'   => (float)$totalRevenue,
                'active_repairs'  => $activeCount,
                'completed_count' => $completedCount,
                'total_bookings'  => $repairs->count(),
            ],
        ], 200);
    }

    public function adminCustomers()
    {
        $customers = User::where('role', 'customer')
            ->withCount('repairs')
            ->withSum('repairs', 'estimate')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($c) {
                return [
                    'id'      => $c->id,
                    'name'    => $c->name,
                    'phone'   => $c->phone,
                    'email'   => $c->email,
                    'repairs' => $c->repairs_count ?? 0,
                    'spent'   => (float)($c->repairs_sum_estimate ?? 0),
                    'last'    => $c->created_at ? $c->created_at->format('d M Y') : 'Recent',
                ];
            });

        return response()->json([
            'success'   => true,
            'customers' => $customers,
        ], 200);
    }

    public function show($id)
    {
        $repair = Repair::with('user')->find($id);

        if (!$repair) {
            return response()->json([
                'success' => false,
                'error'   => 'Repair not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $repair,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $repair = Repair::find($id);

        if (!$repair) {
            return response()->json(['success' => false, 'error' => 'Repair not found'], 404);
        }

        $repair->status = $request->status ?? $repair->status;
        if ($request->has('payment_status')) {
            $repair->payment_status = $request->payment_status;
        }
        $repair->save();

        return response()->json([
            'success' => true,
            'message' => "Repair status updated to {$repair->status}",
            'repair'  => $repair,
        ], 200);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $repairId = 'REP-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));

        $repair = Repair::create([
            'id'               => $repairId,
            'user_id'          => $user ? $user->id : 1,
            'device'           => $request->device,
            'service'          => $request->service,
            'problem'          => $request->problem,
            'status'           => 'Pending',
            'estimate'         => $request->estimate ?? 999.00,
            'appointment_date' => $request->appointmentDate ?? now()->addDay(),
            'method'           => $request->method ?? 'Pickup & Delivery',
            'payment_status'   => 'Pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Repair booking created successfully.',
            'data'    => $repair,
        ], 201);
    }
}
