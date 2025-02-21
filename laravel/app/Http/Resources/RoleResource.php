<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource {
    use HandlesResourceDataSelection;

    public function toArray($request): array {
        $dataSource = [
            'id' => $this->id,
            'name' => $this->name,
            'guard_name' => $this->guard_name,
            'users_count' => $this->users_count,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'deletable' => $this->users_count === 0,
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
