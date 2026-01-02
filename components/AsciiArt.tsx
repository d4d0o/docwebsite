'use client';

import React from 'react';

interface AsciiArtProps {
    content: string;
    title?: string;
    language?: string;
}

/**
 * Dedicated component for rendering ASCII art diagrams with proper styling.
 * Ensures monospace font rendering, preserved whitespace, and responsive scrolling.
 */
export function AsciiArt({ content, title, language }: AsciiArtProps): React.JSX.Element {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <figure className="my-8 group relative">
            {/* Copy button */}
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-md bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 z-10"
                aria-label="Copy diagram to clipboard"
                type="button"
            >
                {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </button>

            <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] overflow-hidden shadow-lg">
                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {language || 'Diagram'}
                        </span>
                    </div>
                    {title && (
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            {title}
                        </span>
                    )}
                </div>

                {/* Content area */}
                <div className="p-4 md:p-6 overflow-x-auto">
                    <pre
                        className="ascii-art-content font-mono text-xs md:text-sm leading-relaxed text-gray-800 dark:text-gray-100"
                        style={{
                            whiteSpace: 'pre',
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                            tabSize: 4,
                            fontFeatureSettings: "'liga' 0",
                        }}
                    >
                        {content}
                    </pre>
                </div>
            </div>

            {/* Caption */}
            {title && (
                <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {title}
                </figcaption>
            )}
        </figure>
    );
}

export default AsciiArt;
