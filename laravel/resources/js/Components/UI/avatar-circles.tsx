import { ny } from '@/Lib/Utils';

interface AvatarCirclesProps {
    className?: string;
    numPeople?: number;
    avatarUrls: string[];
}

function AvatarCircles({ numPeople, className, avatarUrls }: AvatarCirclesProps) {
    return (
        <div className={ny('z-10 flex -space-x-4 rtl:space-x-reverse', className)}>
            {avatarUrls.map((url, index) => (
                <img
                    width={40}
                    src={url}
                    key={index}
                    height={40}
                    className='size-10 rounded-full border-2 border-white dark:border-gray-800'
                    alt={`Avatar ${index + 1}`}
                />
            ))}
            <a
                href=''
                className='flex size-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black'
            >
                +{numPeople}
            </a>
        </div>
    );
}

export default AvatarCircles;
