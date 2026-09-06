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
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => true,
                'repairs' => [],
                'data'    => [],
            ], 200);
        }

        $userId = $user->id;
        $query = Repair::with('user')->where('user_id', $userId)->orderBy('created_at', 'desc');

        $repairs = $query->get()->map(function ($r) {
            return [
                'id'               => $r->id,
                'user_id'          => $r->user_id,
                'customer'         => $r->customer_name ?? ($r->user ? $r->user->name : 'Customer'),
                'customer_name'    => $r->customer_name ?? ($r->user ? $r->user->name : 'Customer'),
                'customer_phone'   => $r->customer_phone ?? ($r->user ? $r->user->phone : ''),
                'device'           => $r->device,
                'service'          => $r->service,
                'problem'          => $r->problem,
                'description'      => $r->description,
                'photos'           => $r->photos ?? [],
                'status'           => $r->status,
                'estimate'         => (float)$r->estimate,
                'extra_charges'    => (float)($r->extra_charges ?? 0),
                'extra_charges_note' => $r->extra_charges_note,
                'additional_charges' => $r->additional_charges ?? [],
                'cost'             => (float)$r->estimate,
                'appointment'      => $r->appointment_date ? (is_string($r->appointment_date) ? substr($r->appointment_date, 0, 10) : $r->appointment_date->format('Y-m-d')) : date('Y-m-d'),
                'appointment_date' => $r->appointment_date,
                'time_slot'        => $r->time_slot,
                'method'           => $r->method,
                'address'          => $r->address,
                'payment_status'   => $r->payment_status,
                'created_at'       => $r->created_at ? $r->created_at->toIso8601String() : now()->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'repairs' => $repairs,
            'data'    => $repairs,
        ], 200);
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
            'repair'  => $repair,
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
        if ($request->has('estimate')) {
            $repair->estimate = (float) $request->estimate;
        }
        if ($request->has('extra_charges')) {
            $repair->extra_charges = (float) $request->extra_charges;
        }
        if ($request->has('extra_charges_note')) {
            $repair->extra_charges_note = $request->extra_charges_note;
        }
        if ($request->has('additional_charges')) {
            $charges = $request->additional_charges;
            $repair->additional_charges = is_string($charges) ? json_decode($charges, true) : $charges;
        }
        $repair->save();

        return response()->json([
            'success' => true,
            'message' => "Repair status updated to {$repair->status}",
            'repair'  => $repair->load('user'),
        ], 200);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $userId = $request->user_id ?? ($user ? $user->id : 1);
        
        $repairId = 'REP-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));

        $problem = is_array($request->problem) ? implode(', ', $request->problem) : ($request->problem ?? 'General Diagnosis');
        $photos = is_array($request->photos) ? $request->photos : ($request->photos ? [$request->photos] : []);

        $appointmentDate = null;
        $rawDate = $request->appointment_date ?? $request->appointmentDate;
        if (!empty($rawDate)) {
            try {
                $appointmentDate = \Carbon\Carbon::parse($rawDate)->toDateTimeString();
            } catch (\Throwable $e) {
                $appointmentDate = now()->addDay()->toDateTimeString();
            }
        } else {
            $appointmentDate = now()->addDay()->toDateTimeString();
        }

        $repair = Repair::create([
            'id'               => $repairId,
            'user_id'          => $userId,
            'customer_name'    => $request->customer_name ?? ($user ? $user->name : 'Customer'),
            'customer_phone'   => $request->customer_phone ?? ($user ? $user->phone : ''),
            'device'           => $request->device ?? 'Smartphone',
            'service'          => $request->service ?? 'Diagnosis & Repair',
            'problem'          => $problem,
            'description'      => $request->description,
            'photos'           => $photos,
            'status'           => 'Booking Created',
            'estimate'         => (float)($request->estimate ?? $request->cost ?? 999.00),
            'appointment_date' => $appointmentDate,
            'time_slot'        => $request->time_slot ?? $request->slot ?? '11:00 AM',
            'method'           => $request->method ?? 'Pickup & Delivery',
            'address'          => $request->address ?? 'Home Address',
            'payment_status'   => 'Pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Repair booking created successfully.',
            'repair'  => $repair,
            'data'    => $repair,
        ], 201);
    }

    public function destroy($id)
    {
        $repair = Repair::find($id);

        if (!$repair) {
            return response()->json(['success' => false, 'error' => 'Repair booking not found'], 404);
        }

        // Delete associated uploaded images from public/uploads if any
        if (!empty($repair->photos) && is_array($repair->photos)) {
            foreach ($repair->photos as $photoUrl) {
                $filename = basename($photoUrl);
                $filePath = public_path('uploads/' . $filename);
                if (\Illuminate\Support\Facades\File::exists($filePath)) {
                    \Illuminate\Support\Facades\File::delete($filePath);
                }
            }
        }

        $repair->delete();

        return response()->json([
            'success' => true,
            'message' => "Repair booking #{$id} deleted successfully.",
        ], 200);
    }
}

