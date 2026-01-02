'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import Link from 'next/link';

interface SearchResult {
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
}

interface SearchProps {
    data: SearchResult[];
    placeholder?: string;
}

/**
 * Global search component with fuzzy matching and keyboard shortcuts.
 * Supports Cmd+K / Ctrl+K to open search.
 */
export function Search({ data, placeholder = 'Search guides...' }: SearchProps): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Fuse.js for fuzzy search
    const fuse = React.useMemo(() => new Fuse(data, {
        keys: ['title', 'description', 'category'],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
    }), [data]);

    // Handle search
    useEffect(() => {
        if (query.length >= 2) {
            const searchResults = fuse.search(query);
            setResults(searchResults.map((r) => r.item).slice(0, 8));
            setIsOpen(true);
            setSelectedIndex(0);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query, fuse]);

    // Keyboard shortcut: Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }

            if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
                inputRef.current?.blur();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle keyboard navigation
    const handleKeyNavigation = useCallback((e: React.KeyboardEvent): void => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % results.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
                break;
            case 'Enter':
                e.preventDefault();
                const selectedResult = results[selectedIndex];
                if (selectedResult) {
                    window.location.href = selectedResult.url;
                }
                break;
        }
    }, [isOpen, results, selectedIndex]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent): void => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClear = (): void => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className="relative">
                {/* Search icon */}
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>

                <input
                    ref={inputRef}
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyNavigation}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-16 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                    aria-label="Search"
                    aria-expanded={isOpen}
                    aria-controls="search-results"
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    role="combobox"
                />

                {/* Keyboard hint or clear button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query ? (
                        <button
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            aria-label="Clear search"
                            type="button"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ) : (
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                            <span className="text-[10px]">Cmd</span>
                            <span>K</span>
                        </kbd>
                    )}
                </div>
            </div>

            {/* Results dropdown */}
            {isOpen && results.length > 0 && (
                <div
                    id="search-results"
                    className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    role="listbox"
                >
                    {results.map((result, index) => (
                        <Link
                            key={result.id}
                            href={result.url}
                            className={`block px-4 py-3 transition-colors ${index === selectedIndex
                                ? 'bg-blue-50 dark:bg-blue-900/30'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            onClick={() => {
                                setIsOpen(false);
                                setQuery('');
                            }}
                            role="option"
                            aria-selected={index === selectedIndex}
                        >
                            <div className="font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                                {result.title}
                            </div>
                            {result.description && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {result.description}
                                </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {result.category}
                            </div>
                        </Link>
                    ))}

                    {/* Footer with keyboard hints */}
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">Enter</kbd>
                                <span>to select</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">Esc</kbd>
                                <span>to close</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* No results */}
            {isOpen && query.length >= 2 && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 text-center z-50">
                    <p className="text-gray-600 dark:text-gray-400">No results found for &quot;{query}&quot;</p>
                </div>
            )}
        </div>
    );
}

export default Search;
