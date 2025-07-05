<?php

namespace App\Traits\Repositories;

use Illuminate\Database\Eloquent\Builder;

trait HandlesFiltering {
    /**
     * Apply filters to the query based on search parameter.
     */
    public function applySearchFilters(Builder $query, array $searchParams, array $filterableColumns): Builder {
        $searchQueryKey = config('constants.handles_filtering_search_query_key');
        if (isset($searchParams[$searchQueryKey])) {
            $query->where(function ($query) use ($searchParams, $filterableColumns, $searchQueryKey) {
                foreach ($filterableColumns as $column) {
                    $query->orWhere($column, 'like', '%' . $searchParams[$searchQueryKey] . '%');
                }
            });
        }

        return $query;
    }

    public function applyColumnFilters(Builder $query, array $searchParams, array $filterableColumns): Builder {
        $columnFiltersKey = config('constants.handles_filtering_column_filters_query_key');
        if (isset($searchParams[$columnFiltersKey])) {
            foreach ($searchParams[$columnFiltersKey] as $key => $value) {
                if (!in_array($key, $filterableColumns)) {
                    continue;
                }
                if (is_array($value)) {
                    if (array_key_exists('from', $value) && array_key_exists('to', $value)) {
                        $query->whereBetween($key, [$value['from'], $value['to']]);
                    } elseif (array_key_exists('from', $value)) {
                        $query->where($key, '>=', $value['from']);
                    } elseif (array_key_exists('to', $value)) {
                        $query->where($key, '<=', $value['to']);
                    } elseif (is_numeric(key($value))) {
                        $query->whereIn($key, $value);
                    }
                } else {
                    $query->where($key, $value);
                }
            }
        }

        return $query;
    }

    /**
     * Apply filters to the query based on search parameters for related models.
     */
    public function applyRelationSearchFilters(Builder $query, array $searchParams, array $relationFilterableColumns): Builder {
        $searchQueryKey = config('constants.handles_filtering_search_query_key');
        if (isset($searchParams[$searchQueryKey])) {
            foreach ($relationFilterableColumns as $relation => $columns) {
                $query->orWhereHas($relation, function ($query) use ($searchParams, $columns, $searchQueryKey) {
                    foreach ($columns as $column) {
                        $query->where($column, 'like', '%' . $searchParams[$searchQueryKey] . '%');
                    }
                });
            }
        }

        return $query;
    }

    /**
     * Apply filters based on relationship array values, using the new safer nested structure.
     *
     * @param  Builder  $query  The query builder instance
     * @param  array  $searchParams  The search parameters
     * @param  array  $relationshipFilters  Configuration array mapping relation names to filters
     */
    public function applyRelationshipArrayFilters(Builder $query, array $searchParams, array $relationshipFilters): Builder {
        $relationsArrayFilterKey = config('constants.handles_filtering_relations_array_filters_query_key');
        // Check if relations_array_filter exists in the search params
        if (!isset($searchParams[$relationsArrayFilterKey]) || !is_array($searchParams[$relationsArrayFilterKey])) {
            return $query;
        }

        $relationsArrayFilter = $searchParams[$relationsArrayFilterKey];

        foreach ($relationshipFilters as $paramKey => $config) {
            // Skip if this relation isn't in the filters or is empty
            if (!isset($relationsArrayFilter[$paramKey]) || empty($relationsArrayFilter[$paramKey])) {
                continue;
            }

            $values = $relationsArrayFilter[$paramKey];

            // Support both string and array formats for backward compatibility
            if (is_string($values)) {
                $values = explode(',', $values);
            }

            if (!is_array($values)) {
                continue;
            }

            // Get relation and column from config
            $relation = $config['relation'] ?? $paramKey;  // Default to param key if not specified
            $column = $config['column'] ?? 'name';  // Default to 'name' if not specified

            // Separate inclusion and exclusion values
            $includeValues = [];
            $excludeValues = [];

            foreach ($values as $value) {
                if (is_string($value) && str_starts_with($value, '!')) {
                    // Remove the '!' prefix and add to exclusion list
                    $excludeValues[] = substr($value, 1);
                } else {
                    $includeValues[] = $value;
                }
            }

            // Apply inclusion filters
            if (!empty($includeValues)) {
                $query->whereHas($relation, function ($subQuery) use ($column, $includeValues) {
                    $table = $subQuery->getModel()->getTable();
                    $subQuery->whereIn("{$table}.{$column}", $includeValues);
                });
            }

            // Apply exclusion filters
            if (!empty($excludeValues)) {
                $query->whereDoesntHave($relation, function ($subQuery) use ($column, $excludeValues) {
                    $table = $subQuery->getModel()->getTable();
                    $subQuery->whereIn("{$table}.{$column}", $excludeValues);
                });
            }
        }

        return $query;
    }
}
