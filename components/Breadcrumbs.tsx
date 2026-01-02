'use client';

import Link from 'next/link';
import React from 'react';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation component for hierarchical page navigation.
 * Shows path from home to current page with clickable intermediate items.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps): React.JSX.Element {
    return (
        <nav
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-6"
            aria-label="Breadcrumb"
        >
            {/* Home link */}
            <Link
                href="/"
                className="flex items-center p-1 rounded-md hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Home"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={item.href}>
                        {/* Chevron separator */}
                        <svg
                            className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>

                        {isLast ? (
                            /* Current page - not clickable */
                            <span
                                className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            /* Intermediate link */
                            <Link
                                href={item.href}
                                className="px-1 py-0.5 rounded-md hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate max-w-[150px]"
                            >
                                {item.label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

export default Breadcrumbs;
