<?php

namespace App\Http\Resources;

use App\Traits\Resources\JsonResource\HandlesResourceDataSelection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource {
    use HandlesResourceDataSelection;

    /**
     * The base directory for user profile images
     */
    protected $baseDirectory = 'user-profile-images';

    public function toArray(Request $request): array {
        $profileImageUrl = null;
        if ($this->profile_image) {
            $profileImageUrl = Storage::url($this->baseDirectory . '/' . $this->profile_image);
        }

        $dataSource = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'username' => $this->username,
            'email_verified_at' => $this->email_verified_at,
            'password' => $this->password,
            'remember_token' => $this->remember_token,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'profile_image' => $this->profile_image,
            'profile_image_url' => $profileImageUrl,
            'preferences' => $this->preferences,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
        ];

        return $this->filterData($request, $dataSource);
    }
}
