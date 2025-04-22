Case: Creating bulk user entries 

Steps:

1. Backend
    1. IntentEnum.php
        
        Create new intent enum with format of
        
        [MODEL]_[method name that related in process business in controller, e.g. STORE,UPDATE,DELETE,INDEX,UPDATE,EDIT,CREATE]_[process business context name, e.g. BULK_ADD_USER]
        
        The value of those intents is the same as the key
        
        So the complete intent definition based on current case is:
        
        case USER_STORE_BULK_ADD_USER ⇒ ‘USER_STORE_BULK_ADD_USER’;
        
    
    1. [Model]Controller.php
        
        Use the switch condition to override the regular data transaction
        
        ```php
        public function store(StoreUserRequest $request) {
        if ($this->ajax()) {

                switch ($request->get('intent')) {
                    case IntentEnum::USER_STORE_BULK_ADD_USER->value:
                        $this->userService->storeBulkAddUsers($request->validated());

                        return;
                }

                return $this->userService->create($request->validated());
            }
        }
        ```
        
    2. [Model]ServiceInterface.php
        
        Define the required method that will be used in the controller and based on business process needs
        
        ```php
        <?php

        namespace App\Support\Interfaces\Services;

        use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;

        interface UserServiceInterface extends BaseCrudServiceInterface {
            /**
            * Store multiple user in bulk.
            */
            public function storeBulkAddUsers(array $data): void;
        }
        ```
        
    3. [Model]Service.php
        
        Implementation of those service interface
        
        ```php
        <?php

        namespace App\Services;

        use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
        use App\Events\User\UserScreenshotEvent;
        use App\Jobs\ProcessUser;
        use App\Models\User;
        use App\Repositories\UserRepository;
        use App\Support\Enums\UserStatusEnum;
        use App\Support\Interfaces\Repositories\UserRepositoryInterface;
        use App\Support\Interfaces\Services\UserPhoneServiceInterface;
        use App\Support\Interfaces\Services\UserServiceInterface;
        use App\Traits\Services\HandlesPageSizeAll;
        use Illuminate\Contracts\Pagination\LengthAwarePaginator;
        use Illuminate\Support\Facades\DB;
        use Illuminate\Support\Facades\Log;

        class UserService extends BaseCrudService implements UserServiceInterface {
            use HandlesPageSizeAll;

            /**
            * UserService constructor.
            */
            public function __construct(protected UserPhoneServiceInterface $userPhoneService) {
                parent::__construct();
            }

            public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
                $this->handlePageSizeAll();

                return parent::getAllPaginated($search, $pageSize);
            }

            /** @var UserRepository */
            protected $repository;

            protected function getRepositoryClass(): string {
                return UserRepositoryInterface::class;
            }

            /**
            * Store multiple user in bulk using database transaction
            *
            * @param  array  $data  Contains 'users' key with array of user
            */
            public function storeBulkAddUsers(array $data): void {
                // Extract user from the array
                $users = $data['users'] ?? [];
                if (empty($users)) {
                    return;
                }

                try {
                    // Use transaction to ensure all-or-nothing operation
                    DB::transaction(function () use ($users) {
                        foreach ($users as $user) {
                            // Find or create userPhone
                            $userPhone = $this->userPhoneService->findOrCreateFromUser($user);

                            // Create User with userPhone association
                            $this->repository->firstOrCreate([
                                'user' => $user,
                                'user_phone_id' => $userPhone?->id,
                            ], [
                                'user' => $user,
                                'user_phone_id' => $userPhone?->id,
                            ]);
                        }
                    });
                } catch (\Exception $e) {
                    Log::error('Failed to store bulk user: ' . $e->getMessage(), [
                        'users' => $users,
                        'exception' => $e,
                    ]);

                    throw $e; // Re-throw to be handled by the controller
                }
            }

            public function delete($keyOrModel): bool {
                // delete the preview file if exists
                $user = $this->repository->find($keyOrModel);
                if ($user && $user->preview) {
                    $this->deletePreviewFile($user->preview);
                }

                // delete the bookmark user
                return parent::delete($keyOrModel);
            }

            /**
            * Delete the preview file from storage
            */
            protected function deletePreviewFile(string $previewPath): void {
                $filePath = storage_path('app/public/users/previews/' . $previewPath);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            /**
            * Delete the preview file from storage
            */
            public function deletePreview(string $previewPath): bool {
                $this->deletePreviewFile($previewPath);

                return true;
            }
        }

        ```
        
    4. Store[Model]Request.php/Update[Model]Request.php
        
        The same rule applies like controller.php, use the intent to override default request, and more importantly the use of store or update request is based on business process does, in this case we need to use StoreUserRequest.php
        
        ```php
        <?php

        namespace App\Http\Requests\User;

        use App\Support\Enums\IntentEnum;
        use Illuminate\Foundation\Http\FormRequest;

        class StoreUserRequest extends FormRequest {
            public function rules(): array {
                $rules = [
                    'name' => ['required', 'string'],
                    'age' => ['required', 'string'],
                    'username' => ['required', 'string'],
                    'password' => ['required', 'string', 'confirmed']
                ];

                // Handle custom intents if needed
                switch ($this->get('intent')) {
                    case IntentEnum::USER_STORE_BULK_ADD_USER->value:
                        return [
                            'users' => ['required', 'array'],
                            'users.*' => ['required', 'user'],
                        ];
                        break;
                }

                return $rules;
            }
        }
        ```

    5. Note for backend model relation names: use snake lowercase, like user_phones, phone_user

    6. Use model bindings, whether in controller, or in services

    7. Note for implementing data fetching like User::create, consider to use the built-in service or repository method, or access the model through service class, see [service repository package docs](../docs/service-repository-pattern.md) for reference, for example

    DON'T ❌
    ```php
    $totalUrls = BookmarkUrl::where('status', '!=', BookmarkUrlStatusEnum::COMPLETED->value)
                ->where('is_screenshotted', false)
                ->count();
    ```

    DO ✅
    ```php
    $totalUrls = $bookmarkUrlService->modelClass->where([
        'status', '!=', BookmarkUrlStatusEnum::COMPLETED->value,
        'is_screenshotted', false
    ])->count();
    ```

    OR DO THIS ✅
    ```php
    $totalUrls = $bookmarkUrlService->repositoryClass->modelClass->where([
        'status', '!=', BookmarkUrlStatusEnum::COMPLETED->value,
        'is_screenshotted', false
    ])->count();
    ```

    8. When implementing custom process business in controllers, please make sure to consider this
    - Index method is used to conduct a custom data fetching
    - Store method is used to conduct a custom data transaction that involving a bunch of data, e.g. bulk adding user
    - Update method is used to conduct a custom data transaction with focus of current model, e.g. in UserController@update with intent of update user phone numbers
    - Delete (Self Explanatory) basically like update but can be destructive

    9. When using validated request (mostly in update and store in controller), use $request->validated() to get the validated data, for example in UserController@update with intent of update user phone numbers alongside with services to do data manipulation based on specific business process, you can use $this->userService->updatePhone($user,$request->validated()), note: the $user is from data binding from update and or delete method, use $request->validated() to get all submitted data to maintain data granularity, inside service implementation method will be like $validatedData['user_phone_ids'] to get the user_phone_id from the request

2. Frontend
    1. service[Model]Hook.ts
        
        The logic function that orchestrating api transaction of that intent and the business logic, ultimately those function will be called within frontend component
        
        ```ts
        import { createMutation, mutationApi } from '@/helpers';
        import { ROUTES } from '@/support/constants/routes';
        import { TANSTACK_QUERY_KEYS } from '@/support/constants/tanstackQueryKeys';
        import { IntentEnum } from '@/support/enums/intentEnum';
        import { UserResource } from '@/support/interfaces/resources';
        import { serviceHooksFactory } from './serviceHooksFactory';
        import { createMutation, mutationApi } from '@/helpers';

        export const userServiceHook = {
            ...serviceHooksFactory<UserResource>({
                baseRoute: ROUTES.USERS,
                baseKey: TANSTACK_QUERY_KEYS.USERS,
            }),

            /**
            * Add multiple user in bulk from clipboard or text input
            */
            useAddBulkUsers: () => {
                return createMutation({
                    mutationFn: async (params: { users: string[] }) => {
                        return mutationApi({
                            method: 'post',
                            user: route(`${ROUTES.USERS}.store`),
                            data: { users: params.users },
                            params: { intent: IntentEnum.USER_STORE_BULK_ADD_USER },
                        });
                    },
                    invalidateQueryKeys: [{ queryKey: [TANSTACK_QUERY_KEYS.USERS], exact: false }],
                });
            },
            useProcessScreenshots: () => {
                return createMutation({
                    mutationFn: async (params?: { ids?: number[] }) => {
                        return mutationApi({
                            method: 'get',
                            user: route(`${ROUTES.USERS}.index`),
                            params: {
                                intent: IntentEnum.USER_INDEX_SCREENSHOT,
                                ...params,
                            },
                        });
                    },
                    invalidateQueryKeys: [{ queryKey: [TANSTACK_QUERY_KEYS.USERS], exact: false }],
                });
            },
        };
        ```
        
    2. Component that applying process business, e.g. Edit/Create/Index.tsx
    3. Don't forget to implement frontend localization in [pages.php](../../laravel/lang/en/pages.php)
    4. Note for tanstack query is already has helper for loading state, you dont need to create loading state manually, heres the example

    ```ts
        const { mutateAsync: deleteUser, isPending: isDeleting } = userServiceHook.useDelete();
        const { mutateAsync: markAsUnscreenshotted, isPending: isRemovingScreenshot } = userServiceHook.useMarkAsUnscreenshotted();
    ```

    the code above is using isPending as the loading state.

    5. Note: when using the api for data transfer, like "post" and "update" data do not forget to use ```toast.promise``` to make the UX value greater, see the example of [bookmark-user-card.tsx](../../laravel/resources/js/components/bookmark-url/bookmark-url-card.tsx)

    6. Maintain consistency, for example when creating context menu, if one of the menu item has an icon, then the other must have, otherwise all menu item must not have icon

    7. When using route, consider to import ROUTES from '@/support/constants/routes' and use it like this
    ```tsx
    import { ROUTES } from '@/support/constants/routes';
    ...
    route(`${ROUTES.USERS}.index`)
    ```

    8. Dont forget to append id when using edit, delete, show, update endpoint. 
    ```tsx
    route(`${ROUTES.USERS}.edit`, { id: user.id })
    route(`${ROUTES.USERS}.delete`, { id: user.id })
    route(`${ROUTES.USERS}.show`, { id: user.id })
    route(`${ROUTES.USERS}.update`, { id: user.id })
    ```

    9. Use mutateAsync if implementing data mutation,
    ```tsx
    const { mutateAsync: deleteUser, isPending: isDeleting } = userServiceHook.useDelete();
    ```

    10. Any custom services goes to app\Providers\RepositoryServiceProvider.php NOT app\Providers\AppServiceProvider.php

    11. When implementing localization in frontend, please use respective component, for example, when implementing localization in dashboard that shows user graph and in user pages has its needed localization, then please create and use the dashboard localization instead of user localization, this is to maintain the localization consistency. 
        
Special Notes
- Since this project is using docker, make sure to run the command inside the docker container, to access laravel container use 
```sh
docker compose -f docker-compose.dev.yml --env-file laravel/.env exec -it laravel bash
```
- to run artisan, composer, npm command, please refer to [dc.sh](../../dc.sh)
- Don't delete commented code, todos.