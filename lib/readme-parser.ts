/**
 * Parses README.md content to extract title and description
 */

export interface ReadmeData {
  title: string;
  description: string | null;
}

/**
 * Extracts the title from README content
 * Looks for:
 * 1. First H1 heading (# Title)
 * 2. First line if it's a heading-like format
 * 3. Fallback to repo name
 */
function extractTitle(content: string, repoName: string): string {
  // Try to find H1 heading
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Try to find H2 heading if no H1
  const h2Match = content.match(/^##\s+(.+)$/m);
  if (h2Match) {
    return h2Match[1].trim();
  }

  // Try first line if it looks like a title (no markdown, reasonable length)
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // If first line is reasonable length and doesn't start with markdown syntax
    if (firstLine.length > 0 && firstLine.length < 100 && !firstLine.match(/^[#*\-\[\]`]/)) {
      return firstLine;
    }
  }

  // Fallback: format repo name nicely
  return formatRepoName(repoName);
}

/**
 * Formats repo name like "shell-c" to "Shell C" or "unix-shell" to "Unix Shell"
 */
function formatRepoName(repoName: string): string {
  return repoName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extracts a description from README content
 * Looks for:
 * 1. First paragraph after title
 * 2. Content between title and first heading
 * 3. First few sentences
 */
function extractDescription(content: string): string | null {
  const lines = content.split('\n');
  
  // Skip title/header lines
  let startIndex = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.startsWith('#') || line.length === 0) {
      startIndex = i + 1;
    } else {
      break;
    }
  }

  // Collect first paragraph or first few sentences
  let description = '';
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop at next heading
    if (line.startsWith('#')) {
      break;
    }
    
    // Skip empty lines at start
    if (description.length === 0 && line.length === 0) {
      continue;
    }
    
    // Add non-empty lines
    if (line.length > 0) {
      description += (description ? ' ' : '') + line;
      
      // Stop if we have enough content (around 200 chars or 2-3 sentences)
      if (description.length > 150) {
        // Try to end at a sentence boundary
        const sentenceEnd = description.match(/[.!?]\s/);
        if (sentenceEnd) {
          description = description.substring(0, sentenceEnd.index! + 1).trim();
        }
        break;
      }
    } else if (description.length > 0) {
      // Empty line after content - we have a paragraph
      break;
    }
  }

  // Clean up description
  description = description
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove code
    .trim();

  return description.length > 0 ? description : null;
}

/**
 * Parses README.md content and extracts title and description
 */
export function parseReadme(content: string, repoName: string): ReadmeData {
  return {
    title: extractTitle(content, repoName),
    description: extractDescription(content),
  };
}
