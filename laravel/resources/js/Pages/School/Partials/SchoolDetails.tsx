import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { SchoolResource } from '@/Support/Interfaces/Resources';

interface Props {
    school: SchoolResource;
}

export function SchoolDetails({ school }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                    <Badge variant={school.active ? 'success' : 'destructive'}>
                        {school.active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>Contact Information</h3>
                    <div className='grid gap-2 text-sm'>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>Address:</span>
                            <span className='col-span-2'>{school.address}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>City:</span>
                            <span className='col-span-2'>{school.city}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>State:</span>
                            <span className='col-span-2'>{school.state}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>ZIP:</span>
                            <span className='col-span-2'>{school.zip}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>Phone:</span>
                            <span className='col-span-2'>{school.phone}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>Email:</span>
                            <span className='col-span-2'>{school.email}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>Website:</span>
                            <span className='col-span-2'>
                                {school.website && (
                                    <a
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        href={school.website}
                                        className='text-primary hover:underline'
                                    >
                                        {school.website}
                                    </a>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
