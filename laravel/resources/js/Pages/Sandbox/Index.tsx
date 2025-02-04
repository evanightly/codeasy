import Editor from '@monaco-editor/react';

export default function Index() {
    return (
        <div>
            <h1>Sandbox</h1>

            <Editor
                height="90vh"
                defaultLanguage="python"
                defaultValue="print('Ngide')"
            />

            <button type="submit" className='bg-red-500'>Run</button>
        </div>
    );
}
