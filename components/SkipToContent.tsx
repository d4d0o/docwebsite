import React from 'react';

/**
 * Skip to content link for keyboard accessibility.
 * Visible only when focused, allows keyboard users to skip navigation.
 */
export function SkipToContent(): React.JSX.Element {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all"
        >
            Skip to content
        </a>
    );
}

export default SkipToContent;
