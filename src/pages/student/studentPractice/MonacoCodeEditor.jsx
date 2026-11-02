import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const MonacoCodeEditor = ({ code, selectedLanguage, selectedTheme, onCodeChange }) => {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden min-h-0">
            <Editor
                height="100%"
                language={selectedLanguage}
                theme={selectedTheme}
                value={code}
                onMount={handleEditorDidMount}
                onChange={(newValue) => {
                    onCodeChange(newValue);
                }}
                options={{
                    fontSize: 16,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                    fontLigatures: true,
                    lineHeight: 26,
                    padding: { top: 20, bottom: 20 },
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    cursorBlinking: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'solid' : 'smooth',
                    smoothScrolling: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                    scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                        arrowSize: 10,
                        verticalSliderSize: 10,
                        horizontalSliderSize: 10,
                        verticalScrollbarColor: '#3d3d3d',
                        horizontalScrollbarColor: '#3d3d3d',
                        verticalSliderColor: '#6b6b6b',
                        horizontalSliderColor: '#6b6b6b',
                    }
                }}
            />
        </div>
    );
};

export default MonacoCodeEditor;
