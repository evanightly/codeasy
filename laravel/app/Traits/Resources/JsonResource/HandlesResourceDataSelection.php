<?php

namespace App\Traits\Resources\JsonResource;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

trait HandlesResourceDataSelection {
    /**
     * Filter resource data based on the specified query parameter or return default fields.
     * Ensures closures/functions are only invoked for requested fields.
     *
     *
     *
     * ```
     * TODO: ensure to not execute function inside resource if it not requested, example
     *
     * $factory = [
     *  'complex_logic' => function () {return a * (8 ^ 128)}
     * ];
     *
     * if the user NOT pass post_resource=complex_logic those function must not invoked
     * ```
     *
     * ```
     * TODO: UPDATE resolveDataFields usage example to handle above issue
     *
     * $dataSource = [
     *  'test' => function () {
     *  dump('test');
     *  return 'test';
     *  },
     * ];
     *
     * the test will invoked only if its included in the *_resource request explicitly
     * ```
     */
    public function filterData(Request $request, array $dataSource, ?array $default = null): array {
        // Dynamically compute the resource key name for the query string
        $resourceKey = Str::snake(class_basename(static::class));

        // Extract requested fields for this resource from the query string
        $queryFields = $request->query($resourceKey);

        // If no specific fields are requested, return default fields
        if (!$queryFields) {
            return $this->resolveDataFields($default ?? $dataSource);
        }

        // Convert the comma-separated string (e.g., 'title,url') into an array
        $fieldsArray = explode(',', $queryFields);

        // Filter the factory array and resolve only requested fields
        return $this->resolveDataFields(
            collect($dataSource)->only($fieldsArray)->toArray()
        );
    }

    /**
     * Resolve resource fields, evaluating closures when present.
     */
    private function resolveDataFields(array $data): array {
        return collect($data)->map(function ($value) {
            // Execute the closure or return the value directly
            return $value instanceof Closure ? $value() : $value;
        })->toArray();
    }
}
