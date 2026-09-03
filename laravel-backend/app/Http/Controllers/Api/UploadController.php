<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $uploadDir = public_path('uploads');
        if (!File::exists($uploadDir)) {
            File::makeDirectory($uploadDir, 0755, true);
        }

        // 1. Multipart Form File Upload
        if ($request->hasFile('image') || $request->hasFile('file') || $request->hasFile('photo')) {
            $file = $request->file('image') ?? $request->file('file') ?? $request->file('photo');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = 'repair_' . time() . '_' . Str::random(8) . '.' . $extension;
            
            $file->move($uploadDir, $filename);
            
            $baseUrl = $request->getSchemeAndHttpHost();
            $url = '/uploads/' . $filename;
            $fullUrl = $baseUrl . $url;

            return response()->json([
                'success'  => true,
                'message'  => 'Image uploaded successfully.',
                'filename' => $filename,
                'url'      => $url,
                'full_url' => $fullUrl,
            ], 200);
        }

        // 2. Base64 Upload
        if ($request->filled('base64')) {
            $base64Data = $request->input('base64');
            
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                $extension = strtolower($type[1]);
            } else {
                $extension = 'jpg';
            }

            $base64Data = base64_decode(str_replace(' ', '+', $base64Data));
            if ($base64Data === false) {
                return response()->json(['success' => false, 'error' => 'Invalid base64 image data'], 400);
            }

            $filename = 'repair_' . time() . '_' . Str::random(8) . '.' . $extension;
            File::put($uploadDir . '/' . $filename, $base64Data);

            $baseUrl = $request->getSchemeAndHttpHost();
            $url = '/uploads/' . $filename;
            $fullUrl = $baseUrl . $url;

            return response()->json([
                'success'  => true,
                'message'  => 'Image uploaded successfully.',
                'filename' => $filename,
                'url'      => $url,
                'full_url' => $fullUrl,
            ], 200);
        }

        return response()->json([
            'success' => false,
            'error'   => 'No image file or base64 data provided.',
        ], 422);
    }
}
