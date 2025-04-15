Warning: above all circumstances, do not remove the old code, your job is to implement a feature, not modify the entire codebase, **this is always happening at all times.**

Note: all previous code is tested and works fine, you only need to modify part of code to implement certain feature or logic that i requested. I say again, only part of code and that code is directly related to the logic or feature that i requested, if you wanna safely implement a feature, just add the code partially or make a new function, but most importantly if you do this, make sure to implement backward compatibility across the codebase you did change.

Note for frontend changes: about routing if you referring to laravel routes, for example
```ts
route('users.index')
```

do not do the code like above, do it like this

```ts
import {ROUTES} from '@/support/constants/routes'

route(`${ROUTES.USERS}.index`)

```