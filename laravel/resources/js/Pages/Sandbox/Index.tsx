import CodeEditor from '@/Components/CodeEditor';
import { Button, buttonVariants } from '@/Components/UI/button';
import { FloatingCodeHighlight } from '@/Components/UI/floating-code-highlight';
import { Meteors } from '@/Components/UI/meteors';
import Particles from '@/Components/UI/particles';
import { SparkleHover } from '@/Components/UI/sparkle-hover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/UI/tooltip';
import { useDarkMode } from '@/Contexts/ThemeContext';
import { ProgrammingLanguageEnum } from '@/Support/Enums/programmingLanguageEnum';
import { Head, Link, usePage } from '@inertiajs/react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    BookText,
    Brain,
    ChevronRight,
    Code2,
    Columns2,
    Columns3,
    Ellipsis,
    FlaskConical,
    Github,
    Layout,
    Loader2,
    Play,
    RotateCw,
    Share2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Default code sample that looks impressive
const DEFAULT_CODE = `import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans

# Generate sample data with 4 clusters
X, y = make_blobs(
    n_samples=300,
    centers=4,
    cluster_std=0.60,
    random_state=42
)

# Perform K-means clustering
kmeans = KMeans(n_clusters=4)
kmeans.fit(X)
y_kmeans = kmeans.predict(X)

# Plot the data points and cluster centers
plt.figure(figsize=(10, 6))
plt.scatter(X[:, 0], X[:, 1], c=y_kmeans, s=50, cmap='viridis', alpha=0.8)

# Plot the centroids
centers = kmeans.cluster_centers_
plt.scatter(centers[:, 0], centers[:, 1], c='red', s=200, alpha=0.9, marker='X')

plt.title('K-Means Clustering Visualization', fontsize=15)
plt.xlabel('Feature 1', fontsize=12)
plt.ylabel('Feature 2', fontsize=12)
plt.grid(alpha=0.3)

# Add a colorbar
plt.colorbar(label='Cluster')

# Show the plot
plt.tight_layout()
plt.show()

print("K-means clustering completed successfully!")
print(f"Number of clusters: {len(centers)}")
print(f"Cluster centers: \\n{centers}")`;

const EXAMPLE_CODES = [
    {
        name: 'K-Means Clustering',
        icon: <Brain className='h-5 w-5' />,
        code: DEFAULT_CODE,
    },
    {
        name: 'Simple Data Analysis',
        icon: <FlaskConical className='h-5 w-5' />,
        code: `import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Create sample data
data = {
    'Category': ['A', 'B', 'C', 'D', 'E'],
    'Values': [24, 17, 32, 15, 27]
}

# Create DataFrame
df = pd.DataFrame(data)
print("Sample DataFrame:")
print(df)

# Create a bar chart with improved styling
plt.figure(figsize=(10, 6))
ax = sns.barplot(x='Category', y='Values', data=df, palette='viridis')

# Add data labels on top of bars
for i, v in enumerate(df['Values']):
    ax.text(i, v + 0.5, str(v), ha='center', fontweight='bold')

# Add styling
plt.title('Category Distribution', fontsize=16, pad=20)
plt.xlabel('Category', fontsize=12)
plt.ylabel('Values', fontsize=12)
plt.grid(axis='y', alpha=0.3)

# Show the plot
plt.tight_layout()
plt.show()`,
    },
    //     {
    //         name: 'Factorial Calculator',
    //         icon: <Layout className='h-5 w-5' />,
    //         code: `def calculate_factorial(n):
    //     """
    //     Calculate the factorial of a number using recursion
    //     """
    //     if n == 0 or n == 1:
    //         return 1
    //     else:
    //         return n * calculate_factorial(n-1)

    // # Use hardcoded value instead of input()
    // num = 5
    // print(f"Calculating factorial for: {num}")

    // # Calculate and display result
    // result = calculate_factorial(num)
    // print(f"The factorial of {num} is: {result}")

    // # Demonstrate the calculation steps
    // print("\\nCalculation steps:")
    // for i in range(num, 0, -1):
    //     if i == 1:
    //         print(f"{i} = {calculate_factorial(i)}")
    //     else:
    //         print(f"{i} × {i-1}! = {calculate_factorial(i)}")

    // # Try different values by changing the 'num' variable above
    // # For example: num = 7 or num = 10`,
    //     },
];

export default function Index() {
    const { auth } = usePage().props;
    const { isDarkMode } = useDarkMode();
    const [isCompiling, setIsCompiling] = useState(false);
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState<any[]>([]);
    const [showIntro, setShowIntro] = useState(true);
    const [selectedExample, setSelectedExample] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const [layoutMode, setLayoutMode] = useLocalStorage<'stacked' | 'side-by-side'>(
        'code-editor-view',
        'stacked',
    );

    // Add new states for interactive input
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [inputPrompt, setInputPrompt] = useState('');
    const [userInput, setUserInput] = useState('');
    const [executionId, setExecutionId] = useState<string | null>(null);
    const [executionCode, setExecutionCode] = useState('');

    const handleSubmit = async (e?: any, inputResponse?: string) => {
        if (e) e.preventDefault();

        // If it's the first execution or a new code run
        if (!inputResponse) {
            setShowIntro(false);
            setIsCompiling(true);
            setOutput([]);
            setWaitingForInput(false);
            setExecutionCode(code); // Store the current code for continuing execution
        }

        try {
            const payload: any = {
                code: inputResponse ? executionCode : code,
                type: 'sandbox',
            };

            // If we have an execution ID and input response, include them in the request
            if (inputResponse && executionId) {
                payload.execution_id = executionId;
                payload.input_response = inputResponse;
            }

            const res = await window.axios.post(route('sandbox.store'), payload);

            const newOutputs = res.data;

            // Check if the response contains an input request
            const inputRequest = newOutputs.find((out: any) => out.type === 'input_request');
            if (inputRequest) {
                // Store the execution ID for continuing this execution
                setExecutionId(inputRequest.execution_id);
                // Show the input prompt to the user
                setInputPrompt(inputRequest.prompt);
                // Update the UI to show we're waiting for input
                setWaitingForInput(true);
                // Add the prompt to the output display
                setOutput((prev) => [
                    ...prev,
                    {
                        type: 'text',
                        content: inputRequest.prompt,
                    },
                ]);
            } else {
                // Regular output, just append it
                setOutput((prev) => [...prev, ...newOutputs]);
                // Reset execution context
                setExecutionId(null);
                setWaitingForInput(false);
                setUserInput('');
            }
        } catch (error) {
            console.error('Error executing code:', error);
            setOutput([
                {
                    type: 'error',
                    error_type: 'Request Failed',
                    error_msg: 'Failed to execute code',
                    content:
                        'There was a problem connecting to the server. Please try again later.',
                },
            ]);
            // Reset execution state on error
            setExecutionId(null);
            setWaitingForInput(false);
        } finally {
            if (!inputResponse) {
                setIsCompiling(false);
            }
        }
    };

    // New handler for submitting user input
    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Add the user's input to the output display
        setOutput((prev) => [
            ...prev,
            {
                type: 'input',
                content: userInput,
            },
        ]);

        // Send the input to the backend to continue execution
        handleSubmit(null, userInput);

        // Clear the input field for the next potential input
        setUserInput('');
    };

    // Add keyboard event listener for Ctrl+Enter to run code
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Enter') {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [code]);

    const handleCodeChange = (val: string) => {
        setCode(val);
    };

    // Load example code
    const loadExample = (index: number) => {
        setSelectedExample(index);
        setCode(EXAMPLE_CODES[index].code);
    };

    // Share functionality
    const handleShare = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const resetCode = () => {
        setCode(DEFAULT_CODE);
        setSelectedExample(0);
    };

    // Toggle layout between stacked and side-by-side
    const toggleLayout = () => {
        setLayoutMode((prevMode) => (prevMode === 'stacked' ? 'side-by-side' : 'stacked'));
    };

    return (
        <>
            <Head title='Python Sandbox - Interactive Code Editor' />
            <div className='flex min-h-screen flex-col'>
                {/* Fancy Header */}
                <header className='relative overflow-hidden bg-gradient-to-r from-primary to-primary/25 text-primary-foreground shadow-lg'>
                    {/* Background effects */}
                    <div className='absolute inset-0 z-0 opacity-20'>
                        {!isDarkMode ? (
                            <Particles size={2} quantity={50} className='absolute inset-0' />
                        ) : (
                            <Meteors number={10} />
                        )}
                    </div>

                    <div className='relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
                        <div className='flex flex-col items-center justify-between md:flex-row'>
                            <div className='mb-6 md:mb-0'>
                                <SparkleHover>
                                    <h1 className='mb-2 text-3xl font-bold tracking-tight md:text-4xl'>
                                        Python Sandbox
                                    </h1>
                                </SparkleHover>
                                <p className='max-w-xl text-blue-100'>
                                    Write, run, and visualize Python code directly in your browser.
                                    Perfect for experimenting, learning, and sharing data
                                    visualizations.
                                </p>
                            </div>

                            <div className='flex space-x-3'>
                                <Link
                                    href='https://github.com/evanightly/codeasy'
                                    className={buttonVariants({
                                        size: 'lg',
                                    })}
                                >
                                    <Github size={20} />
                                    <span>GitHub</span>
                                </Link>
                                {auth.user.username ? (
                                    <Link
                                        href={route('dashboard.index')}
                                        className={buttonVariants({
                                            size: 'lg',
                                        })}
                                    >
                                        <Layout />
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className={buttonVariants({
                                            size: 'lg',
                                        })}
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <div className='flex flex-grow flex-col bg-background lg:flex-row'>
                    {/* Left sidebar with examples */}
                    <div className='border-r bg-muted/30 p-4 lg:w-64'>
                        <div className='mb-6'>
                            <h3 className='mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground'>
                                Examples
                            </h3>
                            <div className='space-y-1.5'>
                                {EXAMPLE_CODES.map((example, index) => (
                                    <button
                                        onClick={() => loadExample(index)}
                                        key={index}
                                        className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm ${
                                            selectedExample === index
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {example.icon}
                                        <span>{example.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='mb-6'>
                            <h3 className='mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground'>
                                Actions
                            </h3>
                            <div className='space-y-1.5'>
                                <button
                                    onClick={resetCode}
                                    className='flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-muted'
                                >
                                    <RotateCw className='h-5 w-5' />
                                    <span>Reset Code</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className='flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-muted'
                                >
                                    <Share2 className='h-5 w-5' />
                                    <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                                </button>
                                <button
                                    onClick={toggleLayout}
                                    className='flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-muted'
                                >
                                    {layoutMode === 'stacked' ? (
                                        <Columns2 className='h-5 w-5' />
                                    ) : (
                                        <Columns3 className='h-5 w-5' />
                                    )}
                                    <span>
                                        {layoutMode === 'stacked'
                                            ? 'Side-by-Side View'
                                            : 'Stacked View'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Help section */}
                        <div className='mt-auto'>
                            <div className='rounded-lg border border-primary bg-primary/10 p-4'>
                                <h4 className='flex items-center font-medium'>
                                    <BookText className='mr-2 h-4 w-4' />
                                    Learning Resources
                                </h4>
                                <p className='mt-2 text-xs'>
                                    Need help? Check out our extensive learning materials and
                                    tutorials.
                                </p>

                                <Link
                                    href='/register'
                                    className={buttonVariants({
                                        size: 'sm',
                                        variant: 'link',
                                        className: 'mt-2 flex h-auto items-center !p-0',
                                    })}
                                >
                                    Learn more <ChevronRight />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className='flex flex-1 flex-col overflow-x-scroll'>
                        <div className='flex h-full w-full flex-1 flex-col p-4'>
                            {/* Code editor section */}
                            <div
                                className={`flex flex-1 ${layoutMode === 'side-by-side' ? 'flex-row' : 'flex-col'} gap-4`}
                            >
                                <div
                                    className={`relative ${layoutMode === 'side-by-side' ? 'w-1/2' : 'flex-1'} overflow-hidden rounded-lg border bg-card shadow-sm`}
                                >
                                    {/* Floating elements for visual appeal */}
                                    <FloatingCodeHighlight className='absolute -right-40 -top-40 opacity-10' />
                                    <FloatingCodeHighlight className='absolute -bottom-40 -left-40 opacity-10' />

                                    <div className='flex items-center justify-between border-b bg-muted/50 px-4 py-2'>
                                        <div className='flex items-center space-x-2'>
                                            <div className='flex space-x-1'>
                                                <div className='h-3 w-3 rounded-full bg-red-500'></div>
                                                <div className='h-3 w-3 rounded-full bg-yellow-500'></div>
                                                <div className='h-3 w-3 rounded-full bg-green-500'></div>
                                            </div>
                                            <div className='text-sm font-medium'>
                                                python_sandbox.py
                                            </div>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant='ghost' size='icon'>
                                                            <PythonIcon />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Python 3.x</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant='ghost' size='icon'>
                                                            <Ellipsis />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Other languages coming soon</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    <CodeEditor
                                        value={code}
                                        showThemePicker={true}
                                        onChange={handleCodeChange}
                                        language={ProgrammingLanguageEnum.PYTHON}
                                        height={layoutMode === 'side-by-side' ? '100%' : '500px'}
                                        headerClassName='ml-3 mt-3'
                                        headerChildren={
                                            <div className='flex justify-end'>
                                                <Button
                                                    onClick={(e) => handleSubmit(e)}
                                                    disabled={isCompiling || waitingForInput}
                                                    className='bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                                                >
                                                    {isCompiling ? (
                                                        <>
                                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                            Running...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className='mr-2 h-4 w-4' />
                                                            Run Code (Ctrl + Enter)
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        }
                                        className='relative'
                                    />
                                </div>

                                {/* Output section */}
                                <div
                                    className={`${layoutMode === 'side-by-side' ? 'w-1/2' : 'mt-2'}`}
                                >
                                    <div className='mb-2 flex items-center justify-between'>
                                        <h2 className='flex items-center text-lg font-semibold'>
                                            <Code2 className='mr-2 h-5 w-5' /> Output
                                        </h2>
                                        {output.length > 0 && !waitingForInput && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() => {
                                                    setOutput([]);
                                                    setExecutionId(null);
                                                    setWaitingForInput(false);
                                                }}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>

                                    <div className='max-h-[700px] overflow-auto rounded-lg border bg-muted/30 p-4'>
                                        {isCompiling ? (
                                            <div className='flex items-center justify-center py-8'>
                                                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                                                <span className='ml-3'>Executing code...</span>
                                            </div>
                                        ) : showIntro && output.length === 0 ? (
                                            <div className='py-8 text-center'>
                                                <Code2 className='mx-auto mb-2 h-12 w-12 text-muted-foreground' />
                                                <h3 className='text-lg font-medium'>
                                                    Ready to execute your code
                                                </h3>
                                                <p className='mt-1 text-muted-foreground'>
                                                    Press the Run button or use Ctrl+Enter to see
                                                    your results here
                                                </p>
                                            </div>
                                        ) : output.length === 0 ? (
                                            <div className='py-8 text-center'>
                                                <div className='text-muted-foreground'>
                                                    No output to display
                                                </div>
                                            </div>
                                        ) : (
                                            <AnimatePresence>
                                                {output.map((out: any, i) => (
                                                    <motion.div
                                                        transition={{ delay: i * 0.05 }}
                                                        key={i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        {out.type === 'image' ? (
                                                            <img
                                                                src={out.content}
                                                                className='mx-auto h-auto max-w-full rounded'
                                                                alt='Visualization Output'
                                                            />
                                                        ) : out.type === 'error' ? (
                                                            <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4'>
                                                                <div className='mb-1 flex items-center font-medium text-destructive'>
                                                                    <AlertCircle className='mr-2 h-4 w-4' />
                                                                    {out.error_type}:{' '}
                                                                    {out.error_msg}
                                                                </div>
                                                                <pre className='max-h-[200px] overflow-auto whitespace-pre-wrap rounded bg-card p-2 text-sm'>
                                                                    {out.content}
                                                                </pre>
                                                            </div>
                                                        ) : out.type === 'input' ? (
                                                            // Show user input differently
                                                            <div className='rounded-md border border-primary/30 bg-primary/5 p-3'>
                                                                <pre className='overflow-x-auto whitespace-pre-wrap text-sm'>
                                                                    <span className='font-medium text-primary'>
                                                                        ≫{' '}
                                                                    </span>
                                                                    {out.content}
                                                                </pre>
                                                            </div>
                                                        ) : (
                                                            <pre className='overflow-x-auto whitespace-pre-wrap text-sm'>
                                                                {out.content}
                                                            </pre>
                                                        )}
                                                    </motion.div>
                                                ))}

                                                {/* Interactive input form */}
                                                {waitingForInput && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        className='mt-4'
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <form
                                                            onSubmit={handleInputSubmit}
                                                            className='flex items-center gap-2'
                                                        >
                                                            <input
                                                                value={userInput}
                                                                type='text'
                                                                placeholder='Type your input here...'
                                                                onChange={(e) =>
                                                                    setUserInput(e.target.value)
                                                                }
                                                                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background'
                                                                autoFocus
                                                            />
                                                            <Button type='submit'>Submit</Button>
                                                        </form>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const PythonIcon = (props: React.ComponentProps<'svg'>) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            viewBox='0 0 256 255'
            height='20'
            {...props}
        >
            <defs>
                <linearGradient
                    y2='233.972'
                    y1='12.88'
                    x2='224.782'
                    x1='12.959'
                    id='a'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop stopColor='#387EB8' offset='0' />
                    <stop stopColor='#366994' offset='1' />
                </linearGradient>
                <linearGradient
                    y2='252.425'
                    y1='85.333'
                    x2='243.234'
                    x1='85.411'
                    id='b'
                    gradientUnits='userSpaceOnUse'
                >
                    <stop stopColor='#FFE052' offset='0' />
                    <stop stopColor='#FFC331' offset='1' />
                </linearGradient>
            </defs>
            <path
                fill='url(#a)'
                d='M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z'
            />
            <path
                fill='url(#b)'
                d='M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z'
            />
        </svg>
    );
};
