import { serviceHooksFactory } from '@/Services/serviceHooksFactory';
import { ROUTES } from '@/Support/Constants/routes';
import { IntentEnum } from '@/Support/Enums/intentEnum';
import { LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { useQuery } from '@tanstack/react-query';

export const learningMaterialServiceHook = {
    ...serviceHooksFactory<LearningMaterialResource>({
        baseRoute: ROUTES.LEARNING_MATERIALS,
    }),
    customFunctionExample: async () => {
        console.log('custom function');
    },
    useGetPdfAsBase64: (filePath: string) => {
        return useQuery({
            queryKey: ['learning-material-pdf-base64', filePath],
            queryFn: async () => {
                const response = await window.axios.get(
                    route(`${ROUTES.LEARNING_MATERIALS}.index`),
                    {
                        params: {
                            intent: IntentEnum.LEARNING_MATERIAL_INDEX_PDF_BASE64,
                            file_path: filePath,
                        },
                    },
                );
                return response.data;
            },
            enabled: !!filePath,
        });
    },
};
