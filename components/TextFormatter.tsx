
import React, { useState, useCallback } from 'react';
import { ClipboardIcon, MagicWandIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon, CheckIcon } from './Icons';

const formatOptions = [
    { value: 'both', label: 'Hyphen + Comma' },
    { value: 'hyphen', label: 'Hyphen (-)' },
    { value: 'comma', label: 'Comma (,)' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Title Case' },
];

const layoutOptions = [
    { value: 'newline', label: 'New Line' },
    { value: 'single', label: 'Single Line' },
];

const TextFormatter: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [formatType, setFormatType] = useState('both');
    const [layoutType, setLayoutType] = useState('newline');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const showToast = (message: string, type: 'success' | 'warning') => {
        setToast({ message, type });
        setIsExiting(false);
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => setToast(null), 300); // Wait for exit animation
        }, 2700);
        return () => clearTimeout(timer);
    };

    const handleFormat = useCallback(() => {
        if (!inputText.trim()) {
            showToast('No input text found!', 'warning');
            return;
        }

        let result = '';
        switch(formatType) {
            case 'uppercase':
                result = inputText.toUpperCase();
                break;
            case 'lowercase':
                result = inputText.toLowerCase();
                break;
            case 'capitalize':
                result = inputText
                    .split('\n')
                    .map(line =>
                        line.split(' ').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')
                    )
                    .join('\n');
                break;
            default: // 'both', 'hyphen', 'comma'
                const lines = inputText.split('\n').map(line => line.trim()).filter(Boolean);
                const formatted = lines.map(line => {
                    const base = line.toLowerCase().replace(/\s+/g, '-');
                    if (formatType === "hyphen") return base;
                    if (formatType === "comma") return line.toLowerCase() + ',';
                    if (formatType === "both") return base + ',';
                    return line;
                });
                result = layoutType === "single" ? formatted.join(' ') : formatted.join('\n');
        }

        setOutputText(result);
    }, [inputText, formatType, layoutType]);
    
    const handleCopy = useCallback(() => {
        if (!outputText.trim()) {
            showToast('Nothing to copy!', 'warning');
            return;
        }
        if (isCopied) return;

        navigator.clipboard.writeText(outputText)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch(() => showToast('Failed to copy!', 'warning'));
    }, [outputText, isCopied]);

    const handleClear = useCallback(() => {
        setInputText('');
        setOutputText('');
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-primary-dark dark:text-primary mb-2">Smart Text Formatter</h2>
            <p className="text-center text-light-muted dark:text-dark-muted mb-6">Paste your text, choose your options, and get a neatly formatted output instantly.</p>
            
            <textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text here..."
                className="w-full h-40 p-3 font-mono text-sm bg-light-bg/50 dark:bg-dark-bg/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary transition-all duration-300"
            />

            <div className="flex flex-col md:flex-row justify-between items-center my-4 gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="formatType" className="text-sm font-medium text-light-muted dark:text-dark-muted">Format:</label>
                    <select id="formatType" value={formatType} onChange={(e) => setFormatType(e.target.value)} className="bg-light-card dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:border-primary transition-all duration-300">
                        {formatOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                {['both', 'hyphen', 'comma'].includes(formatType) && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="layoutType" className="text-sm font-medium text-light-muted dark:text-dark-muted">Layout:</label>
                        <select id="layoutType" value={layoutType} onChange={(e) => setLayoutType(e.target.value)} className="bg-light-card dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:border-primary transition-all duration-300">
                            {layoutOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center gap-3 my-6">
                <button onClick={handleFormat} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transform hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 focus:outline-none">
                    <MagicWandIcon className="w-5 h-5" /> Format
                </button>
                <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 w-[120px] text-white font-bold py-2 px-4 rounded-lg transform hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 focus:outline-none ${
                        isCopied ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                >
                    {isCopied ? (
                        <>
                            <CheckIcon className="w-5 h-5" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-5 h-5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
                <button onClick={handleClear} title="Clear" className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 focus:outline-none">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            
            <h3 className="font-semibold mb-2 text-light-text dark:text-dark-text">Output:</h3>
            <pre className="w-full h-40 p-3 font-mono text-sm bg-light-bg/50 dark:bg-dark-bg/50 border border-gray-300 dark:border-gray-600 rounded-lg whitespace-pre-wrap break-words overflow-y-auto">
                {outputText || ''}
            </pre>

            {toast && (
                <div 
                    className={`fixed bottom-5 right-5 flex items-center gap-3 bg-light-card dark:bg-dark-card py-3 px-5 rounded-lg shadow-2xl border border-gray-200/50 dark:border-gray-700/50 ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
                    role="alert"
                >
                    {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                    {toast.type === 'warning' && <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />}
                    <span className="font-medium text-light-text dark:text-dark-text">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default TextFormatter;
