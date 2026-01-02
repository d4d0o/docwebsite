import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

/**
 * Skeleton loading placeholder component.
 * Shows animated pulse effect while content is loading.
 */
export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height
}: SkeletonProps): React.JSX.Element {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

/**
 * Text skeleton with multiple lines.
 */
export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps): React.JSX.Element {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

/**
 * Chapter content skeleton loader.
 */
export function ChapterSkeleton(): React.JSX.Element {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Loading content">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" variant="circular" />
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-4 h-4" variant="circular" />
                <Skeleton className="w-32 h-4" />
            </div>

            {/* Title skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12" variant="rectangular" />
                <Skeleton className="w-64 h-10" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-8">
                <SkeletonText lines={4} />

                {/* Code block skeleton */}
                <Skeleton className="w-full h-48" />

                <SkeletonText lines={3} />

                {/* Inline code / paragraph skeleton */}
                <div className="space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-5/6 h-4" />
                    <Skeleton className="w-4/5 h-4" />
                </div>

                {/* Another code block */}
                <Skeleton className="w-full h-32" />

                <SkeletonText lines={2} />
            </div>
        </div>
    );
}

export default Skeleton;
