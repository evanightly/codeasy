import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { ClassRoomStudentResource } from '@/Support/Interfaces/Resources';

export const classRoomStudentServiceHook = {
    ...serviceHooksFactory<ClassRoomStudentResource>({
        baseRoute: ROUTES.CLASS_ROOM_STUDENTS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
};
