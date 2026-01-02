'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RoadmapTreeNode } from '@/lib/github';

interface RoadmapListProps {
    tree: RoadmapTreeNode;
    repoName: string;
}

interface FlattenedNode {
    id: string;
    label: string;
    type: 'root' | 'part' | 'chapter';
    slug?: string;
    description?: string;
    depth: number;
}

export default function RoadmapList({ tree, repoName }: RoadmapListProps) {
    const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());

    // Load completion status
    useEffect(() => {
        const loadProgress = () => {
            const stored = localStorage.getItem(`progress_${repoName}`);
            if (stored) {
                try {
                    setCompletedChapters(new Set(JSON.parse(stored)));
                } catch (e) {
                    console.error('Failed to parse progress', e);
                }
            }
        };
        loadProgress();
        // Listen for storage events to update real-time if changed elsewhere
        window.addEventListener('storage', loadProgress);
        return () => window.removeEventListener('storage', loadProgress);
    }, [repoName]);

    // Flatten the tree for list rendering
    const flattenTree = (node: RoadmapTreeNode, depth = 0): FlattenedNode[] => {
        const result: FlattenedNode[] = [];

        // Don't add root node to list, just its children
        if (node.type !== 'root') {
            result.push({
                id: node.id,
                label: node.label,
                type: node.type,
                slug: node.slug,
                description: node.description,
                depth,
            });
        }

        if (node.children) {
            node.children.forEach(child => {
                result.push(...flattenTree(child, depth + 1));
            });
        }
        return result;
    };

    const flatNodes = flattenTree(tree);

    // Helper to format numeric chapter ID (01, 02...)
    const getChapterNumber = (slug?: string) => {
        if (!slug) return '';
        const match = slug.match(/^(\d+)/);
        return match ? match[1].padStart(2, '0') : '';
    };

    // Helper to clean title
    const getTitle = (label: string, type: string) => {
        if (type === 'part') {
            return label.replace(/^part\s+\d+[:\s-]*/i, '').trim() || label;
        }
        return label
            .replace(/^\d+[-_]?/, '')
            .replace(/_/g, ' ')
            .replace('.md', '')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header if needed, but tabs handle "Implementation Track" context */}

            <div className="space-y-4">
                {flatNodes.map((node) => {
                    if (node.type === 'part') {
                        return (
                            <div key={node.id} className="pt-8 pb-4">
                                <h3 className="text-xl font-bold text-gray-200 uppercase tracking-wide border-b border-gray-800 pb-2">
                                    {node.label}
                                </h3>
                            </div>
                        );
                    }

                    if (node.type === 'chapter') {
                        const isCompleted = node.slug && completedChapters.has(node.slug);
                        const chapterNum = getChapterNumber(node.slug);

                        return (
                            <Link
                                href={node.slug ? `/${repoName}/${node.slug}` : '#'}
                                key={node.id}
                                className="group block relative"
                            >
                                <div className={`
                  relative flex items-center p-6 rounded-xl border transition-all duration-300
                  ${isCompleted
                                        ? 'bg-gray-900/30 border-green-900/40 hover:border-green-700/60'
                                        : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                    }
                `}>

                                    {/* Left: Chapter Number */}
                                    <div className="flex-shrink-0 mr-6">
                                        <div className="text-2xl font-mono font-bold text-gray-700 group-hover:text-gray-500 transition-colors">
                                            {chapterNum}
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-wider mt-1">
                                            Task
                                        </div>
                                    </div>

                                    {/* Middle: Content */}
                                    <div className="flex-grow min-w-0 pr-4">
                                        <h4 className="text-lg font-bold text-gray-200 group-hover:text-white mb-2 transition-colors truncate">
                                            {getTitle(node.label, node.type)}
                                        </h4>
                                        {node.description && (
                                            <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed line-clamp-2">
                                                {node.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: Metadata & Status */}
                                    <div className="flex-shrink-0 flex items-center gap-4">
                                        {/* Tags (static for now as requested) */}
                                        <span className="hidden sm:inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-gray-900 text-gray-500 border border-gray-800">
                                            Chapter
                                        </span>

                                        {/* Status Circle */}
                                        <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${isCompleted
                                                ? 'bg-green-500 border-green-500' // Filled green if checked
                                                : 'border-gray-700 group-hover:border-gray-500' // Empty grey if not
                                            }
                    `}>
                                            {isCompleted && (
                                                <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}
