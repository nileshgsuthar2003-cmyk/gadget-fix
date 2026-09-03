<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class BannerController extends Controller
{
    /**
     * Get active banners for public app/web frontend.
     */
    public function index()
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'banners' => $banners,
        ]);
    }

    /**
     * Get all banners for Admin portal.
     */
    public function adminIndex()
    {
        $banners = Banner::orderBy('display_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'banners' => $banners,
        ]);
    }

    /**
     * Create a new advertisement banner.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge_text' => 'nullable|string|max:100',
            'image_url' => 'nullable|string',
            'bg_gradient' => 'nullable|string',
            'link_type' => 'nullable|string',
            'link_value' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $banner = Banner::create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'badge_text' => $validated['badge_text'] ?? 'SPECIAL OFFER',
            'image_url' => $validated['image_url'] ?? null,
            'bg_gradient' => $validated['bg_gradient'] ?? 'blue',
            'link_type' => $validated['link_type'] ?? 'book',
            'link_value' => $validated['link_value'] ?? null,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            'display_order' => $validated['display_order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Advertisement banner created successfully!',
            'banner' => $banner,
        ], 201);
    }

    /**
     * Update an advertisement banner.
     */
    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge_text' => 'nullable|string|max:100',
            'image_url' => 'nullable|string',
            'bg_gradient' => 'nullable|string',
            'link_type' => 'nullable|string',
            'link_value' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $banner->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Banner updated successfully!',
            'banner' => $banner,
        ]);
    }

    /**
     * Delete an advertisement banner.
     */
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // Remove uploaded physical image if exists
        if ($banner->image_url && str_starts_with($banner->image_url, '/uploads/')) {
            $physicalPath = public_path(ltrim($banner->image_url, '/'));
            if (File::exists($physicalPath)) {
                File::delete($physicalPath);
            }
        }

        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted successfully!',
        ]);
    }
}
