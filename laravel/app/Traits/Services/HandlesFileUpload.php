<?php

namespace App\Traits\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HandlesFileUpload {
    /**
     * Handle file upload to a specific folder
     *
     * @param  UploadedFile  $file  The file to upload
     * @param  string  $baseDirectory  Base directory where files will be stored
     * @param  string|null  $subfolder  Optional subfolder within the base directory
     * @param  bool  $preserveFileName  Whether to preserve the original filename
     * @return string|null The path to the stored file
     */
    protected function uploadFile(
        UploadedFile $file,
        string $baseDirectory,
        ?string $subfolder = null,
        bool $preserveFileName = false
    ): ?string {
        if (!$file) {
            return null;
        }

        // Determine the full path
        $path = $baseDirectory;
        if ($subfolder) {
            $path = $path . '/' . trim($subfolder, '/');
        }

        // Create directory if it doesn't exist
        if (!Storage::exists('public/' . $path)) {
            Storage::makeDirectory('public/' . $path, 0755, true);
        }

        // Generate filename
        if ($preserveFileName) {
            // Clean the original filename and make it safe
            $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
            $filename .= '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        } else {
            // Generate a completely unique filename
            $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        }

        // Store the file
        $file->storeAs('public/' . $path, $filename);

        // Return the relative path for database storage
        return $path . '/' . $filename;
    }

    /**
     * Delete a file from storage
     */
    protected function deleteFile(string $filePath): bool {
        if (empty($filePath)) {
            return false;
        }

        return Storage::delete('public/' . $filePath);
    }

    /**
     * Get the publicly accessible URL for a file
     */
    protected function getFileUrl(string $filePath): ?string {
        if (empty($filePath)) {
            return null;
        }

        return Storage::url('public/' . $filePath);
    }
}
