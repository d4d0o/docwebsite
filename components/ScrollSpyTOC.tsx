'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
}

interface ScrollSpyTOCProps {
    headings: Heading[];
    title?: string;
}

/**
 * Table of Contents component with scroll spy functionality.
 * Highlights the current section based on scroll position.
 */
export function ScrollSpyTOC({ headings, title = 'On This Page' }: ScrollSpyTOCProps): React.JSX.Element | null {
    const [activeId, setActiveId] = useState<string>('');

    const handleScroll = useCallback((): void => {
        // Get all heading elements
        const headingElements = headings
            .map(({ id }) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (headingElements.length === 0) return;

        // Find the heading that is currently in view
        const scrollPosition = window.scrollY + 120; // Offset for header

        for (let i = headingElements.length - 1; i >= 0; i--) {
            const element = headingElements[i];
            if (element.offsetTop <= scrollPosition) {
                setActiveId(element.id);
                return;
            }
        }

        // Default to first heading if none found
        if (headingElements[0]) {
            setActiveId(headingElements[0].id);
        }
    }, [headings]);

    useEffect(() => {
        // Initial check
        handleScroll();

        // Add scroll listener with passive option for performance
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string): void => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Offset for sticky header
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth',
            });
        }
    };

    if (headings.length === 0) {
        return null;
    }

    return (
        <nav className="sticky top-24 space-y-1" aria-label="Table of contents">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                </svg>
                {title}
            </h3>

            <ul className="space-y-1">
                {headings.map((heading) => {
                    const isActive = activeId === heading.id;
                    const indent = heading.level === 2 ? 'pl-0' : heading.level === 3 ? 'pl-3' : 'pl-6';

                    return (
                        <li key={heading.id}>
                            <a
                                href={`#${heading.id}`}
                                onClick={(e) => handleClick(e, heading.id)}
                                className={`
                  block text-sm py-1.5 border-l-2 transition-all duration-150
                  ${indent}
                  ${isActive
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-medium pl-3 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 pl-3'
                                    }
                `}
                            >
                                <span className="line-clamp-1">{heading.text}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

/**
 * Utility function to extract headings from rendered content.
 * Should be called after content is rendered.
 */
export function extractHeadings(containerElement: HTMLElement | null): Heading[] {
    if (!containerElement) return [];

    const headingElements = containerElement.querySelectorAll('h2, h3, h4');
    const headings: Heading[] = [];

    headingElements.forEach((element) => {
        const id = element.id || element.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
        const text = element.textContent || '';
        const level = parseInt(element.tagName.charAt(1), 10);

        if (id && text) {
            // Ensure element has an id
            if (!element.id) {
                element.id = id;
            }
            headings.push({ id, text, level });
        }
    });

    return headings;
}

export default ScrollSpyTOC;
