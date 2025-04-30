<?php

namespace App\Traits\Repositories;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Trait for handling sorting in repositories
 *
 * @generated Laravel Forgemate Initializer
 */
trait HandlesSorting {
    /**
     * Apply sorting to the query based on the given parameters.
     */
    protected function applySorting(Builder $query, array $searchParams = []): Builder {
        $sortByQueryKey = config('constants.handles_sorting_sort_by_query_key', 'sort_by');
        $sortDirQueryKey = config('constants.handles_sorting_sort_dir_query_key', 'sort_dir');
        $sortByRelationCountKey = config('constants.handles_sorting_sort_by_relation_count_key', 'sort_by_relation_count');
        $sortDirRelationCountKey = config('constants.handles_sorting_sort_dir_relation_count_key', 'sort_dir_relation_count');
        $sortByRelationFieldKey = config('constants.handles_sorting_sort_by_relation_field_key', 'sort_by_relation_field');
        $sortDirRelationFieldKey = config('constants.handles_sorting_sort_dir_relation_field_key', 'sort_dir_relation_field');

        // Regular column sorting
        if (isset($searchParams[$sortByQueryKey])) {
            $query->orderBy($searchParams[$sortByQueryKey], $searchParams[$sortDirQueryKey] ?? 'desc');
        }

        // Relation count sorting - can now be applied in addition to column sorting
        if (isset($searchParams[$sortByRelationCountKey])) {
            $relationName = $searchParams[$sortByRelationCountKey];
            // Use relation-specific direction if available, otherwise fall back to general direction or desc
            $direction = $searchParams[$sortDirRelationCountKey] ?? $searchParams[$sortDirQueryKey] ?? 'desc';

            // Ensure we have a valid relation name
            if (!empty($relationName)) {
                // Add withCount for the relation - Laravel will handle duplicates automatically
                $query->withCount($relationName);

                // Sort by the relation count
                $query->orderBy("{$relationName}_count", $direction);
            }
        }

        // Sort by relation field(s)
        if (isset($searchParams[$sortByRelationFieldKey]) && is_array($searchParams[$sortByRelationFieldKey])) {
            foreach ($searchParams[$sortByRelationFieldKey] as $sortInfo) {
                if (!isset($sortInfo['relation']) || !isset($sortInfo['field'])) {
                    continue;
                }

                $relation = $sortInfo['relation'];
                $field = $sortInfo['field'];
                $direction = $sortInfo['direction'] ?? ($searchParams[$sortDirRelationFieldKey] ?? $searchParams[$sortDirQueryKey] ?? 'desc');

                $this->sortByRelationField($query, $relation, $field, $direction);
            }
        }

        return $query;
    }

    /**
     * Sort the query by a field in a relation.
     *
     * @param  Builder  $query  The query builder
     * @param  string  $relation  The relation name (can be nested using dot notation)
     * @param  string  $field  The field to sort by
     * @param  string  $direction  The sort direction (asc or desc)
     */
    protected function sortByRelationField(Builder $query, string $relation, string $field, string $direction): Builder {
        // For direct relations, we can join and sort directly
        if (strpos($relation, '.') === false) {
            $model = $query->getModel();
            $table = $model->getTable();

            // Select main table columns to avoid field conflicts
            $query->select("{$table}.*");

            // Make sure the relation exists on the model
            if (!method_exists($model, $relation)) {
                return $query;
            }

            // Get the relation instance
            $relationInstance = $model->{$relation}();
            $relatedModel = $relationInstance->getRelated();
            $relatedTable = $relatedModel->getTable();

            // Join the relation table based on relation type
            $this->joinRelation($query, $model, $relation);

            // Add the order by clause
            $query->orderBy("{$relatedTable}.{$field}", $direction);

            // Add distinct to avoid duplicate rows due to the join
            $query->distinct();
        } else {
            // For nested relations, we'll use withAggregate which is more reliable
            $query->withAggregate(
                $relation,
                $field,
                strtolower($direction) === 'asc' ? 'min' : 'max'
            );

            // Create the aggregate column name (Laravel naming convention)
            $aggregateColumn = str_replace('.', '_', $relation) . '_' . $field . '_' .
                (strtolower($direction) === 'asc' ? 'min' : 'max');

            // Sort by the aggregate column
            $query->orderBy($aggregateColumn, $direction);
        }

        return $query;
    }

    /**
     * Join a relation table to the query.
     *
     * @param  Builder  $query  The query builder
     * @param  mixed  $model  The model instance
     * @param  string  $relationName  The relation name
     */
    protected function joinRelation(Builder $query, $model, string $relationName): void {
        $relation = $model->{$relationName}();
        $relatedTable = $relation->getRelated()->getTable();
        $baseTable = $model->getTable();

        // Join strategies for different relation types
        if ($relation instanceof BelongsTo) {
            // For BelongsTo: parent.foreign_key = related.primary_key
            $foreignKey = $relation->getForeignKeyName();
            $ownerKey = $relation->getOwnerKeyName();

            $query->leftJoin($relatedTable, function ($join) use ($baseTable, $foreignKey, $relatedTable, $ownerKey) {
                $join->on("{$baseTable}.{$foreignKey}", '=', "{$relatedTable}.{$ownerKey}");
            });
        } elseif ($relation instanceof HasOne || $relation instanceof HasMany) {
            // For HasOne/HasMany: parent.primary_key = related.foreign_key
            $foreignKey = $relation->getForeignKeyName();
            $localKey = $relation->getLocalKeyName();

            $query->leftJoin($relatedTable, function ($join) use ($baseTable, $localKey, $relatedTable, $foreignKey) {
                $join->on("{$baseTable}.{$localKey}", '=', "{$relatedTable}.{$foreignKey}");
            });
        } elseif ($relation instanceof BelongsToMany) {
            // For BelongsToMany: join through pivot table
            $pivotTable = $relation->getTable();
            $foreignPivotKey = $relation->getForeignPivotKeyName();
            $relatedPivotKey = $relation->getRelatedPivotKeyName();
            $relatedKey = $relation->getRelated()->getKeyName();

            $query->leftJoin($pivotTable, function ($join) use ($baseTable, $model, $pivotTable, $foreignPivotKey) {
                $join->on("{$baseTable}.{$model->getKeyName()}", '=', "{$pivotTable}.{$foreignPivotKey}");
            })->leftJoin($relatedTable, function ($join) use ($pivotTable, $relatedPivotKey, $relatedTable, $relatedKey) {
                $join->on("{$pivotTable}.{$relatedPivotKey}", '=', "{$relatedTable}.{$relatedKey}");
            });
        }
        // Add more relation types if needed (e.g., HasOneThrough, MorphTo, etc.)
    }
}
