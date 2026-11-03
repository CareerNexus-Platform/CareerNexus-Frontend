import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/request';
import getUserId from '../../../services/getUserId';
import EditorHeader from './EditorHeader';
import MonacoCodeEditor from './MonacoCodeEditor';
import OutputConsole from './OutputConsole';

import QuestionPanel from "./QuestionPanel";

const CODE_TEMPLATES = {
    javascript: "console.log('Hello World!');",
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}`,
    python: "print('Hello World!')",
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!";\n    return 0;\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello World!");\n    return 0;\n}`
};

const DEFAULT_START_MESSAGE = "// Start coding...\n// Happy Coding!";

const CodeEditor = ({ sessionId, initialCode, initialLanguage = "javascript", initialTheme = "vs-dark", question: externalQuestion, onCodeChange, onLanguageChange, onThemeBrightnessChange }) => {
    const [code, setCode] = useState(initialCode ?? CODE_TEMPLATES[initialLanguage] ?? DEFAULT_START_MESSAGE);
    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
    const [selectedTheme, setSelectedTheme] = useState(initialTheme);
    const [executionOutput, setExecutionOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [question, setQuestion] = useState(null);
    const [customInput, setCustomInput] = useState("");

    const isLightMode = selectedTheme.includes('light');

    const themeStyles = {
        panel: isLightMode ? 'bg-white/95 border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:border-brand-400 hover:shadow-[0_0_25px_rgba(65, 45, 32,0.15)] text-gray-900' : 'bg-ink/60 border-brand-500/20 shadow-[0_0_20px_rgba(65, 45, 32,0.05)] hover:border-brand-500/40 hover:shadow-[0_0_25px_rgba(65, 45, 32,0.1)] text-gray-200',
        header: isLightMode ? 'bg-gray-100/50 border-gray-200 text-brand-700' : 'bg-white/5 border-brand-500/20 text-brand-300',
        textarea: isLightMode ? 'text-gray-900 placeholder-gray-400' : 'text-gray-300 placeholder-gray-500/50',
        fileText: isLightMode ? 'text-gray-700' : 'text-gray-300'
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (onThemeBrightnessChange) {
            onThemeBrightnessChange(isLightMode);
        }
    }, [isLightMode, onThemeBrightnessChange]);

    const availableLanguages = [
        { name: "JavaScript", value: "javascript", version: "18.15.0" },
        { name: "Java", value: "java", version: "15.0.2" },
        { name: "Python", value: "python", version: "3.10.0" },
        { name: "C++", value: "cpp", version: "10.2.0" },
        { name: "C", value: "c", version: "10.2.0" },
    ];

    const availableThemes = [
        { name: "VS Dark", value: "vs-dark" },
        { name: "VS Light", value: "vs-light" },
        { name: "High Contrast Dark", value: "hc-black" },
        { name: "High Contrast Light", value: "hc-light" }
    ];

    // --- useEffect for question rendering ---
    useEffect(() => {
        if (externalQuestion) {
            setQuestion(externalQuestion);
            return;
        }
        const fetchQuestion = async () => {
            if (!sessionId) return; // Skip fetch if no sessionId
            try {
                const res = await api.get(`/practice/question/${sessionId}`);
                if (res.data?.question) {
                    setQuestion(res.data.question);
                } else {
                    setQuestion(null);
                }
            } catch {
                setQuestion(null);
            }
        };

        fetchQuestion();
    }, [sessionId, externalQuestion]);

    // Callback for changing the selected programming language
    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setSelectedLanguage(newLanguage);
        if (onLanguageChange) onLanguageChange(newLanguage);

        // Apply default template if the editor is currently empty or holding an existing template
        const currentTrimmedCode = code.trim();
        const isDefaultCode = currentTrimmedCode === "" ||
            currentTrimmedCode === DEFAULT_START_MESSAGE.trim() ||
            Object.values(CODE_TEMPLATES).some(template => template.trim() === currentTrimmedCode);

        if (isDefaultCode && CODE_TEMPLATES[newLanguage]) {
            const newCode = CODE_TEMPLATES[newLanguage];
            setCode(newCode);
        }
    };

    // Callback for changing the editor theme
    const handleThemeChange = (event) => {
        setSelectedTheme(event.target.value);
    };

    // Callback for handling the user leaving the session
    const handleLeaveSession = () => {
        const userId = getUserId();
        if (userId) {
            navigate(`/student/${userId}/home`);
        } else {
            navigate('/student/login');
        }
    };

    // Callback for running the code through the backend's compilation/execution service
    const handleRunCode = async () => {
        setIsExecuting(true);
        setExecutionOutput("Running code...");

        const currentLangConfig = availableLanguages.find(lang => lang.value === selectedLanguage);
        if (!currentLangConfig || !currentLangConfig.version || currentLangConfig.version === "latest") {
            setExecutionOutput("Error: Selected language might not be executable.");
            toast.error("Unsupported language for execution.");
            setIsExecuting(false);
            return;
        }

        const requiresInputRegEx = /(?:input\s*\()|(?:Scanner\s*\()|(?:cin\s*>>)|(?:scanf\s*\()/;
        if (requiresInputRegEx.test(code) && !customInput.trim()) {
            toast.error("Input required! Please add it to the Custom Input box.");
            setIsExecuting(false);
            setExecutionOutput("Execution blocked.\nPlease provide the required input in the 'Custom Input' box below before running.");
            return;
        }

        try {
            const response = await api.post(
                '/student/code/run',
                {
                    language: currentLangConfig.value,
                    code: code,
                    stdin: customInput,
                }
            );

            const result = response.data;
            let output = "";

            if (result.compileStdout) { output += "COMPILE OUTPUT:\n" + result.compileStdout + "\n"; }
            if (result.compileStderr) { output += "COMPILE ERROR:\n" + result.compileStderr + "\n"; }
            if (result.stdout) { output += "OUTPUT:\n" + result.stdout; }
            if (result.stderr) { output += "RUNTIME ERROR:\n" + result.stderr; }
            if (result.error) {
                if (output) output += "\n";
                output += "SERVICE ERROR: " + result.error;
            }
            if (result.executionTime !== undefined && result.executionTime !== null) {
                if (output) output += "\n\n";
                output += `--- Execution Time: ${result.executionTime}ms ---`;
            }
            setExecutionOutput(output || "Execution completed with no output.");

        } catch (error) {
            console.error("Error executing code:", error);
            if (error.response) {
                setExecutionOutput(`ERROR: ${error.response.status} - ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
                toast.error(`Code execution failed: ${error.response.status}`);
            } else {
                setExecutionOutput("Network error or server unreachable.");
                toast.error("Failed to connect to execution server.");
            }
        } finally {
            setIsExecuting(false);
        }
    };

    const handleCodeChangeForParent = (newCode) => {
        setCode(newCode);
        if (onCodeChange) onCodeChange(newCode);
    };

    return (
        <div className={`flex flex-col h-full w-full p-2 sm:p-4 bg-transparent font-outfit ${isLightMode ? 'text-gray-900' : 'text-gray-200'}`}>
            <EditorHeader
                selectedLanguage={selectedLanguage}
                selectedTheme={selectedTheme}
                availableLanguages={availableLanguages}
                availableThemes={availableThemes}
                handleLanguageChange={handleLanguageChange}
                handleThemeChange={handleThemeChange}
                handleRunCode={handleRunCode}
                handleLeaveSession={handleLeaveSession}
                isExecuting={isExecuting}
                isLightMode={isLightMode}
            />

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4">
                {question && (
                    <div className={`w-full lg:w-[35%] h-full overflow-hidden rounded-2xl backdrop-blur-xl transition-all border ${themeStyles.panel}`}>
                        <QuestionPanel question={question} isLightMode={isLightMode} />
                    </div>
                )}

                <div className={`w-full ${question ? 'lg:w-[65%]' : 'lg:w-full'} h-full flex flex-col gap-4 min-h-0`}>

                    {/* Top: Monaco Code Editor */}
                    <div className={`flex-1 flex flex-col min-h-0 rounded-2xl backdrop-blur-xl overflow-hidden transition-all border ${themeStyles.panel}`}>
                        {/* Editor Tab Header */}
                        <div className={`border-b px-4 py-2.5 flex items-center justify-between z-10 shrink-0 ${themeStyles.header}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${selectedLanguage === 'python' ? 'bg-brand-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : selectedLanguage === 'javascript' ? 'bg-brand-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]' : selectedLanguage === 'cpp' || selectedLanguage === 'c' ? 'bg-brand-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]'}`}></span>
                                <span className={`text-sm font-semibold tracking-wide font-mono ${themeStyles.fileText}`}>
                                    main.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : 'c'}
                                </span>
                            </div>
                        </div>
                        <div className="cn-editor-surface flex-1 min-h-0 p-1">
                            <MonacoCodeEditor
                                code={code}
                                selectedLanguage={selectedLanguage}
                                selectedTheme={selectedTheme}
                                onCodeChange={handleCodeChangeForParent}
                            />
                        </div>
                    </div>

                    {/* Bottom: Input & Console split */}
                    <div className="h-[22vh] md:h-44 flex flex-col md:flex-row gap-4 shrink-0">
                        <div className={`w-full md:w-[40%] flex flex-col rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 border ${themeStyles.panel}`}>
                            <div className={`px-4 py-3 text-sm font-semibold border-b flex items-center gap-2 shrink-0 ${themeStyles.header}`}>
                                <span className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(65, 45, 32,0.8)]"></span>
                                Custom Input
                            </div>
                            <textarea
                                aria-label="Custom standard input"
                                className={`flex-1 w-full bg-transparent p-4 text-sm resize-none outline-none font-mono custom-scrollbar ${themeStyles.textarea}`}
                                placeholder="Enter custom standard input here..."
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                            />
                        </div>
                        <div className={`w-full md:w-[60%] flex flex-col rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 border ${themeStyles.panel}`}>
                            <OutputConsole executionOutput={executionOutput} isLightMode={isLightMode} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
