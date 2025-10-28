
import React, { useState, useCallback } from 'react';
import { AnalysisResult, TopWord } from '../types';
import { TrashIcon } from './Icons';

// Helper function to find the main content of a webpage
const getMainContent = (doc: Document): HTMLElement => {
    const selectors = [
        'article',
        'main',
        '.post-content',
        '.entry-content',
        '[role="main"]',
        '.td-post-content',
        '.story-content'
    ];
    for (const selector of selectors) {
        const element = doc.querySelector<HTMLElement>(selector);
        if (element) return element;
    }
    // Fallback to body but clean it from common irrelevant tags
    const body = doc.body.cloneNode(true) as HTMLElement;
    body.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .ad, [role="navigation"], [role="banner"], [role="complementary"]').forEach(el => el.remove());
    return body;
};

const stopWords = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't", 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', "can't", 'cannot', 'could', "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have', "haven't", 'having', 'he', "he'd", "he'll", "he's", 'her', 'here', "here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's",
  'i', "i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's", 'its', 'itself',
  "let's", 'me', 'more', 'most', "mustn't", 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', "shan't", 'she', "she'd", "she'll", "she's", 'should', "shouldn't", 'so', 'some', 'such',
  'than', 'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', "there's", 'these', 'they', "they'd", "they'll", "they're", "they've", 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', "wasn't", 'we', "we'd", "we'll", "we're", "we've", 'were', "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which', 'while', 'who', "who's", 'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't",
  'you', "you'd", "you'll", "you're", "you've", 'your', 'yours', 'yourself', 'yourselves'
]);

const ArticleWordCounter: React.FC = () => {
    const [inputType, setInputType] = useState<'url' | 'text'>('url');
    const [url, setUrl] = useState('');
    const [articleText, setArticleText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const performAnalysis = (text: string) => {
        const cleanText = text.replace(/\s\s+/g, ' ').trim();
        if (!cleanText) {
            throw new Error('Could not extract any text content from the article.');
        }

        const totalWordCount = cleanText.split(/\s+/).filter(Boolean).length;
        const totalCharCount = cleanText.length;
        const totalCharCountNoSpaces = cleanText.replace(/\s/g, '').length;
        
        const words = cleanText.toLowerCase().match(/\b[a-z']+\b/g) || [];
        // Fix: Explicitly type the accumulator `acc` to ensure correct type inference,
        // which resolves all downstream type errors.
        const wordCounts = words.reduce((acc: Record<string, number>, word) => {
            if (!stopWords.has(word) && word.length > 1) {
                acc[word] = (acc[word] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topWords: TopWord[] = Object.entries(wordCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 10)
            .map(([word, count]) => ({
                word,
                count,
                density: totalWordCount > 0 ? (count / totalWordCount) * 100 : 0,
            }));

        setResult({
            totalWordCount,
            totalCharCount,
            totalCharCountNoSpaces,
            preview: cleanText.substring(0, 300) + (cleanText.length > 300 ? '...' : ''),
            topWords,
        });
    };

    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            if (inputType === 'url') {
                if (!url.trim()) {
                    throw new Error('Please enter a valid URL.');
                }
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
                }
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const articleContent = getMainContent(doc);
                if (!articleContent) {
                    throw new Error('Could not find the main article content on the page.');
                }
                const rawText = articleContent.textContent || '';
                performAnalysis(rawText);
            } else { // 'text'
                if (!articleText.trim()) {
                    throw new Error('Please paste some text to analyze.');
                }
                performAnalysis(articleText);
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [url, inputType, articleText]);

    const handleClear = useCallback(() => {
        setResult(null);
        setError(null);
        setUrl('');
        setArticleText('');
    }, []);
    
    const InputTabs = () => (
        <div className="flex justify-center bg-light-bg/80 dark:bg-dark-bg/80 rounded-lg p-1 w-full max-w-xs mx-auto mb-6">
            <TabButton label="From URL" isActive={inputType === 'url'} onClick={() => setInputType('url')} />
            <TabButton label="From Text" isActive={inputType === 'text'} onClick={() => setInputType('text')} />
        </div>
    );
    
    const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
        <button
          onClick={onClick}
          className={`relative flex-1 py-2 px-4 text-sm font-semibold transition-colors duration-300 focus:outline-none rounded-md ${
            isActive
              ? 'text-primary-dark dark:text-primary bg-light-card dark:bg-dark-card shadow-sm'
              : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
          }`}
        >
          {label}
        </button>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-primary-dark dark:text-primary mb-2">Article Word Counter</h2>
            <p className="text-center text-light-muted dark:text-dark-muted mb-6">Analyze from a webpage URL or paste text directly to count words.</p>
            
            <InputTabs />

            <div className={`flex ${inputType === 'text' ? 'flex-col gap-4' : 'flex-col sm:flex-row gap-2'}`}>
                {inputType === 'url' ? (
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="flex-grow p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary transition-all duration-300"
                    />
                ) : (
                    <textarea
                        value={articleText}
                        onChange={(e) => setArticleText(e.target.value)}
                        placeholder="Paste your article text here..."
                        className="w-full h-32 p-3 font-sans text-sm bg-light-bg/50 dark:bg-dark-bg/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary transition-all duration-300"
                    />
                )}
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className={`bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center transform hover:-translate-y-1 active:scale-95 focus:outline-none ${inputType === 'text' ? 'self-center' : ''}`}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Analyze'}
                </button>
            </div>
            
            {inputType === 'url' && <p className="text-xs text-center text-light-muted dark:text-dark-muted mt-2">Note: This tool may not work for all sites due to CORS security policies.</p>}

            {error && <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm animate-fade-in-up">{error}</div>}

            {result && (
                <div className="mt-6 p-6 bg-light-bg/50 dark:bg-dark-bg/50 border border-gray-200 dark:border-gray-700 rounded-lg animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-primary">Analysis Complete</h3>
                        <button
                            onClick={handleClear}
                            title="Clear Result"
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 focus:outline-none"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-light-card dark:bg-dark-card rounded-lg shadow-sm transition-transform duration-200 hover:scale-105">
                            <div className="text-3xl font-bold text-primary-dark dark:text-primary">{result.totalWordCount}</div>
                            <div className="text-sm text-light-muted dark:text-dark-muted">Total Words</div>
                        </div>
                        <div className="p-4 bg-light-card dark:bg-dark-card rounded-lg shadow-sm transition-transform duration-200 hover:scale-105">
                            <div className="text-3xl font-bold">{result.totalCharCount}</div>
                            <div className="text-sm text-light-muted dark:text-dark-muted">Total Characters</div>
                        </div>
                        <div className="p-4 bg-light-card dark:bg-dark-card rounded-lg shadow-sm transition-transform duration-200 hover:scale-105">
                            <div className="text-3xl font-bold">{result.totalCharCountNoSpaces}</div>
                            <div className="text-sm text-light-muted dark:text-dark-muted">Chars (no spaces)</div>
                        </div>
                    </div>

                    {result.topWords.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold mb-2 text-light-text dark:text-dark-text">Top 10 Words</h4>
                            <div className="overflow-x-auto bg-light-card dark:bg-dark-card rounded-lg shadow-sm">
                                <table className="w-full text-sm text-left text-light-text dark:text-dark-text">
                                    <thead className="bg-light-bg/50 dark:bg-dark-bg/50 text-xs uppercase text-light-muted dark:text-dark-muted">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 font-semibold">Word</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-center">Count</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-right">Density</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.topWords.map((item) => (
                                            <tr key={item.word} className="border-b dark:border-gray-700 last:border-b-0 hover:bg-light-bg/50 dark:hover:bg-dark-bg/50 transition-colors duration-150">
                                                <td scope="row" className="px-4 py-2 font-medium capitalize">{item.word}</td>
                                                <td className="px-4 py-2 text-center">{item.count}</td>
                                                <td className="px-4 py-2 text-right font-mono">{item.density.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-center text-light-muted dark:text-dark-muted mt-2">Common English words (e.g., "the", "a", "is") are excluded.</p>
                        </div>
                    )}
                    
                    <div className="mt-6">
                        <h4 className="font-semibold mb-2">Content Preview:</h4>
                        <p className="text-sm text-light-muted dark:text-dark-muted p-4 bg-light-card dark:bg-dark-card rounded-lg max-h-32 overflow-y-auto italic">
                            {result.preview || "No preview available."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleWordCounter;