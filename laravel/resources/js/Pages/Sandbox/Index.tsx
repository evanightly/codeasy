import Editor from '@monaco-editor/react';
import { useState } from 'react';

export default function Index() {
    const [code, setCode] = useState("print('Ngide')");
    const [output, setOutput] = useState([]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const res = await window.axios.post(route('sandbox.store'), {
            code,
            testcases: [],
        });
        console.log(res);

        setOutput(res.data);
    };
    return (
        <div>
            <h1>Sandbox</h1>

            <Editor
                height="90vh"
                defaultLanguage="python"
                value={code}
                onChange={(value, event) => setCode(value || '')}
            />

            <button onClick={handleSubmit} type="submit" className="bg-red-500">
                Run
            </button>

            <div className="flex flex-col gap-2">
                {output.map((out, i) => {
                    if (out.type === 'image') {
                        return <img key={i} src={out.content} alt="output" />;
                    }

                    return (
                        <div key={i} className="p-3">
                            {out.content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
