<?php

namespace App\Helpers;

use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;

class FileHelper {
    public function __construct(protected Filesystem $files) {}

    /**
     * @throws FileNotFoundException
     */
    public function replaceFileWithStubContent(string $path, string $stubPath, bool $forceReplace = false): void {
        $this->createDirectoryIfNotExists($path);

        if ($forceReplace || !$this->files->exists($path)) {
            $stub = $this->files->get($stubPath);
            $this->files->put($path, $stub);
        }
    }

    public function replaceFileWithContent(string $path, string $content, bool $forceReplace = false): void {
        $this->createDirectoryIfNotExists($path);

        if ($forceReplace || !$this->files->exists($path)) {
            $this->files->put($path, $content);
        }
    }

    public function checkFileExistence(string $path): bool {
        if ($this->files->exists($path)) {
            //            // Assuming you have access to the console command's warn method
            //            // You might need to pass the command instance to this helper if needed
            //            echo "Frontend file already exists: {$path}\n";

            return true;
        }

        return false;
    }

    public function createDirectoryIfNotExists(string $path): void {
        $directory = dirname($path);

        if (!$this->files->exists($directory)) {
            $this->files->makeDirectory($directory, 0755, true);
        }
    }
}
