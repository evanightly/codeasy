import { Button } from '@/Components/UI/button';
import { python } from '@codemirror/lang-python';
import { Head } from '@inertiajs/react';
import CodeMirror from '@uiw/react-codemirror';
import { useCallback, useState } from 'react';

export default function Index() {
    const [code, setCode] = useState("print('Ngide')");
    const [output, setOutput] = useState([]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const res = await window.axios.post(route('sandbox.store'), {
            code,
            type: 'sandbox',
        });
        console.log(res);

        setOutput(res.data);
    };

    const onChange = useCallback((val, viewUpdate) => {
        console.log('val:', val);
        setCode(val);
    }, []);

    return (
        <div>
            <Head>
                <title>Sandbox</title>
            </Head>
            <div className="flex flex-col gap-4">
                <h1>Sandbox</h1>
                <p>
                    Warning: visualizations generated by sandbox will be deleted
                    in 2 days
                </p>
            </div>
            <CodeMirror
                value={code}
                height="200px"
                extensions={[python()]}
                onChange={onChange}
            />

            <Button onClick={handleSubmit} type="submit">
                Run
            </Button>

            <div className="flex flex-col gap-2">
                {output.map((out, i) => {
                    if (out.type === 'image') {
                        return (
                            <img
                                className="mx-auto w-[50rem] rounded bg-gray-100"
                                key={i}
                                src={out.content}
                                alt="output"
                            />
                        );
                    }

                    return (
                        <div key={i} className="rounded bg-gray-100 p-3">
                            {out.content}
                        </div>
                    );
                })}
            </div>
        </div>
