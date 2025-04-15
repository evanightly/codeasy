# Nine Saved Post V6

This is a Laravel 12 and ReactJS project with a focus on modularity, maintainability, and scalability. The project is designed to handle complex business logic through a repository-service pattern and an intent-based system for routing requests.
The goal is to create a clean and efficient codebase that adheres to best practices in both Laravel and ReactJS development.
The project is built with a focus on TypeScript for the frontend, ensuring type safety and maintainability. The backend is built with Laravel 12, utilizing the latest features and best practices in PHP development and more importantly this project is containerized with docker to simplify project setup for development and production environment.
This system is designed for one user only, the authentication feature is only for first login only, if the database already has one user, the user automatically logged in.

The main process business about this project is autograding application with automatic classification of students' level of understanding using Bloom's taxonomy theory (2001), the questions in the autograding are about data science which refers to the Indonesian National Work Competency Standards (SKKNI). The classification mechanism is by using rule based, each module has 6 materials / questions / questions, if students successfully complete question 1, then students can proceed to question 2, students can also proceed to the next module but with restrictions. when students will work on the next module, students are allowed to work on material if students have tried the material in the previous module (trying is not necessarily correct / finished). The data that will be used for Data Science learning is academic data from SIAKAD polinema. Testing of this application will be carried out on 20 students of the Polinema Informatics Engineering Department class of 2023 in python courses, data science, and the like. This project was developed using Laravel, Inertia React, MariaDB, I usually use NYXB (https://nyxbui.design/) as a component library, I also use service repository patterns (https://github.com/adobrovolsky97/laravel-repository-service-pattern) in developing applications, and use tanstack queries and tables to optimize data manipulation. 

This project is mainly developed using windows, so please handle the PowerShell's command separator syntax, and this project is containerized with docker, so it will run in docker environment, and i will use docker-compose to run the project in development and production environment.

This project is using tailwind v4, so the implementation is quite different, like we dont need to use tailwind.config.js to configure the tailwind, we can just use app.css to configure it.

## Stack

- Laravel
- Inertia: Laravel and ReactJS adapter
- Fastapi: Mainly for data analysis and image processing
- ReactJS
- MariaDB

Note: this is a typescript project, safe typing is my priority for this project scalability, and windows is my main operating system, but this project will run in docker environment

## Crucial Dependencies

### Backend

- https://github.com/adobrovolsky97/laravel-repository-service-pattern : to handle service and repository process, decouple the application's business logic from the specific implementation details of data storage

### Frontend

- @tanstack/react-query : to handle data transaction process (look at the implementation of the serviceHooksFactory.ts)
- NyxbUI : ReactJS component library, similar with ShadCN but with enhancement of animation and offers unique components

## Project Flow and Architecture

### Overall Data Flow

1. **Frontend Request Initiation**:

   - React components call methods from appropriate service hooks (e.g., `postServiceHook.useCreate()`)
   - Service hooks are created using the `serviceHooksFactory` pattern which standardizes CRUD operations
   - Custom operations use the intent parameter system to trigger specialized logic

2. **Frontend to Backend Communication**:

   - TanStack Query manages API requests, caching, and state invalidation
   - Requests flow through Inertia.js to Laravel backend
   - The `intent` query parameter determines which business logic to execute

3. **Backend Processing**:
   - Controllers receive requests and delegate to appropriate service based on intent
   - Services contain business logic and call repositories for data operations
   - Repositories handle direct data manipulation using Eloquent models
   - Results are transformed through Laravel Resources and returned to frontend

### Frontend Service Hook Pattern

The service hook pattern is built around the `serviceHooksFactory.ts` which:

```typescript
// Standard pattern for all service hooks
export const someModelServiceHook = {
  ...serviceHooksFactory<SomeModelResource>({
    baseRoute: ROUTES.SOME_MODELS,
    baseKey: TANSTACK_QUERY_KEYS.SOME_MODELS,
  }),
  // Custom methods for specific business logic
  useCustomOperation: () => {
    return createMutation({
      mutationFn: async (params) => {
        return mutationApi({
          method: "post",
          url: route(`${ROUTES.SOME_MODELS}.store`),
          data: params,
          params: { intent: IntentEnum.SOME_MODEL_CUSTOM_OPERATION },
        });
      },
      invalidateQueryKeys: [
        { queryKey: [TANSTACK_QUERY_KEYS.SOME_MODELS], exact: false },
      ],
    });
  },
};
```

### Intent System

The intent system routes specific business logic through generic CRUD endpoints:

1. **Frontend**: Intent is specified in the request parameters:

   ```typescript
   params: {
     intent: IntentEnum.SOME_MODEL_CUSTOM_OPERATION;
   }
   ```

2. **Backend Controller**: Controller checks for intent and routes accordingly:

   ```php
   // Typical controller method with intent routing
   public function store(StoreSomeModelRequest $request)
   {
       $intent = $request->get('intent', IntentEnum::DEFAULT_STORE);

       switch($intent) {
           case IntentEnum::SOME_MODEL_CUSTOM_OPERATION:
               return $this->someModelService->customOperation($request->validated());
           default:
               return $this->someModelService->store($request->validated());
       }
   }
   ```

3. **Form Request Validation**: Each intent may have specific validation rules:

   ```php
   // Form request with intent-specific validation
   public function rules(): array
   {
       $rules = [
           'name' => ['required', 'string', 'max:255'],
           'description' => ['nullable', 'string']
       ];

       $intent = $this->get('intent', IntentEnum::DEFAULT_STORE);

       if ($intent === IntentEnum::SOME_MODEL_CUSTOM_OPERATION) {
           $rules['additional_field'] = ['required', 'array'];
       }

       return $rules;
   }
   ```

### Repository-Service Pattern

1. **Services**: Contain business logic, call repositories, handle events:

   ```php
   // Service implementation
   class SomeModelService implements SomeModelServiceInterface
   {
       public function __construct(
           protected SomeModelRepositoryInterface $someModelRepository
       ) {}

       public function customOperation(array $data)
       {
           // Business logic implementation
           $result = $this->someModelRepository->customQuery($data);
           event(new CustomOperationEvent($result));
           return $result;
       }
   }
   ```

2. **Repositories**: Handle data operations using Eloquent:

   ```php
   // Repository implementation
   class SomeModelRepository extends BaseRepository implements SomeModelRepositoryInterface
   {
       public function __construct(SomeModel $model)
       {
           parent::__construct($model);
       }

       public function customQuery(array $data)
       {
           // Data manipulation logic
           return $this->model->where('field', $data['field'])->get();
       }
   }
   ```

### TanStack Query Management

1. **Query Keys**: Centralized in `tanstackQueryKeys.ts`:

   ```typescript
   export const TANSTACK_QUERY_KEYS = {
     SOME_MODELS: "some_models",
     GLOBAL_SOME_MODELS: "global_some_models",
   };
   ```

2. **Query Invalidation**: After mutations, relevant queries are invalidated:

   ```typescript
   invalidateQueryKeys: [
     { queryKey: [TANSTACK_QUERY_KEYS.SOME_MODELS], exact: false },
   ];
   ```

3. **Query Generation**: Helper functions generate consistent query keys:
   ```typescript
   queryKey: generateUseGetAllQueryKey(baseKey, filters);
   ```

### Full Request Lifecycle Example

1. User clicks "Sync Posts" button in UI
2. React component calls `postServiceHook.useSyncPosts().mutate()`
3. `serviceHooksFactory` creates a mutation with `IntentEnum.POST_SYNC_POSTS` intent
4. Request is sent to `/posts` endpoint with intent parameter
5. `PostController@index` receives request, detects intent, calls `PostService@syncPosts`
6. `PostService` contains business logic, delegates to `PostRepository` for data operations
7. `PostService` dispatches `SyncPostsJob` for background processing
8. Job execution progress is broadcast via WebSockets using `SyncProgressEvent`
9. Frontend updates UI based on WebSocket events and refetches data when complete

## Custom Project Structure (with model user as an example)

- Backend
  - App
    - Models
      - User.php : definition of attributes, relation, and other helper method specifically for the current model
    - Support
      - Repositories
        - UserRepositoryInterface.php : store abstract function for UserRepository.php reference
      - Services
        - UserService.php : store abstract function for UserService.php reference
    - Services
      - UserService.php : implementation of UserServiceInterface and other business logic process
    - Repositories
      - UserRepository.php : direct data manipulation logic extending the https://github.com/adobrovolsky97/laravel-repository-service-pattern library
    - Http
      - Resources
        - UserResource.php : structure of data response returned to the frontend/client
      - Requests (following model name directory)
        - User
          - StoreUserRequest : validation of creating user
          - UpdateUserRequest : validation of updating user
- Frontend : resources/js
  - Services
    - userServiceHook.ts : a hook that extends serviceHooksFactory.ts to store data transaction related process
  - Support
    - Interfaces
      - Models
        - User.ts : interface that contains model fillable properties
      - Resources
        - UserResource.ts : interface that extends Model and adding resource keys that defined in the backend UserResource.php

## AI Capabilities and Knowledge Scope

- Knowledge Cutoff: The assistant's knowledge extends to at least October 2024, including Laravel 12 specifics, modern React patterns, and current TanStack Query implementations
- No Live Web Search: The assistant cannot search the web in real-time but has comprehensive knowledge of technologies in use for this project
- NyxbUI Knowledge: NyxbUI is similar to shadcn/ui with enhanced animations and unique components, but follows the same registry-based component installation pattern
- Technical Accuracy: The assistant should prioritize technical accuracy over speculation, especially regarding newer versions of frameworks and libraries
- Code Quality: The assistant should maintain high code quality standards, focusing on modularity, readability, and maintainability
- Error Handling: The assistant should provide clear explanations for errors and suggest best practices for debugging
- Documentation: The assistant should provide clear and concise documentation for any new code or features added to the project
- Testing: The assistant should encourage writing tests for new features and provide guidance on testing strategies
- Performance: The assistant should consider performance implications of code changes and suggest optimizations where necessary
- Security: The assistant should prioritize security best practices, especially when handling user data and authentication
- Scalability: The assistant should consider scalability implications of code changes and suggest architectural improvements where necessary
- Maintainability: The assistant should prioritize maintainability of code, suggesting refactoring opportunities where appropriate
- Collaboration: The assistant should encourage collaboration and discussion around code changes, especially for larger features or architectural changes
- Version Control: The assistant should encourage the use of version control best practices, including branching strategies and commit message conventions
- Continuous Integration/Continuous Deployment (CI/CD): The assistant should encourage the use of CI/CD practices for automated testing and deployment
- Code Reviews: The assistant should encourage code reviews and provide guidance on best practices for conducting reviews
- Documentation: The assistant should encourage thorough documentation of code changes, including inline comments and external documentation where necessary
- User Experience: The assistant should consider user experience implications of code changes and suggest improvements where necessary
- Accessibility: The assistant should prioritize accessibility best practices, especially when implementing UI components
- Internationalization: The assistant should consider internationalization implications of code changes and suggest best practices for implementing i18n
- Localization: The assistant should consider localization implications of code changes and suggest best practices for implementing l10n
- DevOps: The assistant should consider DevOps implications of code changes and suggest best practices for deployment and infrastructure management
- Cloud Services: The assistant should consider cloud service implications of code changes and suggest best practices for cloud deployment and management
- Containerization: The assistant should consider containerization implications of code changes and suggest best practices for Docker deployment and management
- Microservices: The assistant should consider microservices implications of code changes and suggest best practices for microservices architecture
- Serverless: The assistant should consider serverless implications of code changes and suggest best practices for serverless architecture
- Event-Driven Architecture: The assistant should consider event-driven architecture implications of code changes and suggest best practices for implementing event-driven systems
- API Design: The assistant should consider API design implications of code changes and suggest best practices for RESTful and GraphQL APIs
- WebSockets: The assistant should consider WebSocket implications of code changes and suggest best practices for implementing real-time communication
- State Management: The assistant should consider state management implications of code changes and suggest best practices for managing application state
- Data Management: The assistant should consider data management implications of code changes and suggest best practices for managing application data
- Data Storage: The assistant should consider data storage implications of code changes and suggest best practices for managing application data storage
- Data Migration: The assistant should consider data migration implications of code changes and suggest best practices for managing data migrations
- Data Backup: The assistant should consider data backup implications of code changes and suggest best practices for managing data backups
- Data Recovery: The assistant should consider data recovery implications of code changes and suggest best practices for managing data recovery
- Data Security: The assistant should consider data security implications of code changes and suggest best practices for managing data security
- Data Privacy: The assistant should consider data privacy implications of code changes and suggest best practices for managing data privacy
- Data Compliance: The assistant should consider data compliance implications of code changes and suggest best practices for managing data compliance
- Data Governance: The assistant should consider data governance implications of code changes and suggest best practices for managing data governance
- Data Quality: The assistant should consider data quality implications of code changes and suggest best practices for managing data quality
- Data Integrity: The assistant should consider data integrity implications of code changes and suggest best practices for managing data integrity
- Data Modeling: The assistant should consider data modeling implications of code changes and suggest best practices for managing data models
- Data Warehousing: The assistant should consider data warehousing implications of code changes and suggest best practices for managing data warehouses
- Data Lakes: The assistant should consider data lake implications of code changes and suggest best practices for managing data lakes
- Data Analytics: The assistant should consider data analytics implications of code changes and suggest best practices for managing data analytics
- Data Visualization: The assistant should consider data visualization implications of code changes and suggest best practices for managing data visualization
- Data Science: The assistant should consider data science implications of code changes and suggest best practices for managing data science projects
- Data Engineering: The assistant should consider data engineering implications of code changes and suggest best practices for managing data engineering projects
- Data Architecture: The assistant should consider data architecture implications of code changes and suggest best practices for managing data architecture

## Rules

1. If storing file, use Storage::disk('public')->put() 
2. Be opinionated
3. Use latest and stable approach
4. Creativity to make better code is welcome but avoid too much hallucination, stay at the current context
5. This project is using zod for frontend validation, so please use zod for validation instead of using react-hook-form or any other validation library
6. If i ask you about the errors, please explain logically why is that happen so I will understand deeper about the current issue
7. If you want to create custom business process logic other than basic CRUD, use the IntentEnum.php to store custom key that trigger those custom logic in controller, then add condition for those intent in the form request for specific case (either StoreRequest or UpdateRequest depending on the business process logic), so no more new controllers, route, etc, dont worry about IntentEnum.ts, because the vite will always regenerate its content if the IntentEnum.php updated
8. Make the code clean, modular, and generalized, but not too coupled
9. Don't delete anything related to developer comments or notes about // TODO: , // BUG: , etc
10. Any breaking change ideas must be asked first before integrating the code directly on the codebase
11. If i ask to add something, do only adding, DON'T remove other code, focus on the current context to maintain safe code
12. Im up for discussion, if there's anything to ask, ask away, it's better to ask first rather than changing the code with reckless behavior
13. CRUCIAL!: if editing existing code, do not replace the code with the comments like `ts // ...existing code...` it will make the code break and leave thousand of errors
14. CRUCIAL!: DO NOT DELETE UNRELATED CODE, even if it looks like a dead code, just leave it as is, and add the new code below the existing code, so it will not break the existing code
15. CRUCIAL!: DO NOT MODIFY UNRELATED CODE
16. CRUCIAL!: In every prompt i have tested and modified the generated code to match the expected result, so please do not modify the code that i have tested and modified, just add the new code below the existing code