import { ROUTES } from '@/Support/Constants/routes';
import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';

export const classRoomServiceHook = {
    ...serviceHooksFactory<ClassRoomResource>({
        baseRoute: ROUTES.CLASS_ROOMS
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
