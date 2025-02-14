import { Alert, AlertDescription, AlertTitle } from '@/Components/UI/alert';
import { Button } from '@/Components/UI/button';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { python } from '@codemirror/lang-python';
import { Head } from '@inertiajs/react';
import CodeMirror from '@uiw/react-codemirror';
import { AlertCircle, Loader, Loader2, Redo2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function Index() {
    const [isCompiling, setIsCompiling] = useState(false);
    const [code, setCode] = useState("print('Test')");
    const [output, setOutput] = useState([]);

    const handleSubmit = async (e?: any) => {
        // Make e optional since we'll call this without an event from keyboard
        if (e) e.preventDefault();

        setIsCompiling(true);

        const res = await window.axios.post(route('sandbox.store'), {
            code,
            type: 'sandbox',
        });
        console.log(res);

        setOutput(res.data);

        setIsCompiling(false);
    };

    // Add keyboard event listener
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Enter') {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [code]); // Add code as dependency to ensure we have latest code state

    const onChange = useCallback((val: any, viewUpdate: any) => {
        console.log('val:', val);
        setCode(val);
    }, []);

    return (
        <DashboardLayout breadcrumbs={[{ name: 'Sandbox', url: '#' }]}>
            <Head title="Sandbox" />
            <div className="flex flex-col gap-4">
                <Alert variant="warning" className="w-full lg:w-1/2">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                        visualizations generated by sandbox will be deleted in 2
                        days
                    </AlertDescription>
                </Alert>
            </div>
            <div className="flex flex-col lg:flex-row">
                <div className="flex flex-1 flex-col">
                    <CodeMirror
                        value={code}
                        height="500px"
                        extensions={[python()]}
                        onChange={onChange}
                        className="w-full"
                    />

                    <Button
                        disabled={isCompiling}
                        onClick={handleSubmit}
                        type="submit"
                        className="ml-auto flex items-center gap-2"
                    >
                        
                        {isCompiling ? <Loader2 className='size-4 animate-spin'/>: <Redo2 className="size-4" /> }
                        {isCompiling ? 'Running...' : 'Run (Ctrl + Enter)'}
                    </Button>
                </div>

                <div className="flex flex-1 flex-col">
                    <div className="flex flex-col gap-2">
                        {output.map((out: any, i) => {
                            return (
                                <div
                                    key={i}
                                    className="rounded bg-gray-100 p-3"
                                >
                                    {out.type === 'image' ? (
                                        <img
                                            className="mx-auto w-[30rem] rounded bg-gray-100"
                                            key={i}
                                            src={out.content}
                                            alt="output"
                                        />
                                    ) : (
                                        <div
                                            key={i}
                                            className="rounded bg-gray-100 p-3"
                                        >
                                            {out.content}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
