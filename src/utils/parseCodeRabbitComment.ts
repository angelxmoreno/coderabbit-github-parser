export type CodeRabbitCommentType = 'issue' | 'suggestion' | 'other';
export type CodeRabbitSeverity = 'critical' | 'major' | 'minor' | 'info';

export interface ParsedCodeRabbitComment {
    type: CodeRabbitCommentType;
    severity?: CodeRabbitSeverity;
    title: string;
    description: string;
    suggestion?: string;
    aiPrompt?: string;
    rawEmoji: string;
    rawSeverity: string;
}

/**
 * Parse a CodeRabbit review comment body into structured data
 *
 * CodeRabbit comments follow this pattern:
 * _⚠️ Potential issue_ | _🟠 Major_
 * **Title of the issue**
 * Description...
 * <details><summary>📝 Committable suggestion</summary>
 * ```suggestion
 * code here
 * ```
 * </details>
 * <details><summary>🤖 Prompt for AI Agents</summary>
 * AI prompt text
 * </details>
 */
export function parseCodeRabbitComment(body: string): ParsedCodeRabbitComment | null {
    // Check if this looks like a CodeRabbit comment
    if (!body.includes('<!-- This is an auto-generated comment by CodeRabbit -->')) {
        return null;
    }

    const lines = body.split('\n');

    // Find the severity line (first line with emoji and severity)
    const severityLine = lines.find((line) => line.match(/^_[^_]*_\s*\|\s*_[^_]*_/));
    if (!severityLine) {
        return null;
    }

    // Parse severity line: "_⚠️ Potential issue_ | _🟠 Major_"
    const severityMatch = severityLine.match(/^_([^_]*)_\s*\|\s*_([^_]*)_/);
    if (!severityMatch) {
        return null;
    }

    const [, rawEmoji, rawSeverity] = severityMatch;

    // Early exit if regex didn't capture groups properly
    if (!rawEmoji || !rawSeverity) {
        return null;
    }

    // Determine type from emoji/text
    const type: CodeRabbitCommentType = rawEmoji.includes('issue')
        ? 'issue'
        : rawEmoji.includes('suggestion') || rawEmoji.includes('Refactor')
          ? 'suggestion'
          : 'other';

    // Determine severity
    const severity: CodeRabbitSeverity =
        rawSeverity.includes('Critical') || rawSeverity.includes('🔴')
            ? 'critical'
            : rawSeverity.includes('Major') || rawSeverity.includes('🟠')
              ? 'major'
              : rawSeverity.includes('Minor') || rawSeverity.includes('🟡')
                ? 'minor'
                : 'info';

    // Find title (next line with ** formatting)
    const titleMatch = body.match(/\*\*([^*]+)\*\*/);
    const title = titleMatch?.[1] || 'No title found';

    // Extract description (text between title and first <details>)
    const descriptionStart = body.indexOf(`**${title}**`) + title.length + 4;
    const firstDetailsIndex = body.indexOf('<details>');
    const descriptionEnd = firstDetailsIndex > -1 ? firstDetailsIndex : body.length;

    let description = body.substring(descriptionStart, descriptionEnd).trim();

    // Clean up description - remove multiple newlines and markdown artifacts
    description = description.replace(/\n\n+/g, '\n').replace(/^\n|\n$/g, '');

    // Extract code suggestion if present
    let suggestion: string | undefined;
    const suggestionMatch = body.match(/```suggestion\n([\s\S]*?)\n```/);
    if (suggestionMatch?.[1]) {
        suggestion = suggestionMatch[1].trim();
    }

    // Extract AI prompt if present
    let aiPrompt: string | undefined;
    const promptMatch = body.match(
        /<summary>🤖 Prompt for AI Agents<\/summary>\s*```\s*([\s\S]*?)\s*```\s*<\/details>/
    );
    if (promptMatch?.[1]) {
        aiPrompt = promptMatch[1].trim();
    }

    return {
        type,
        severity,
        title,
        description,
        suggestion,
        aiPrompt,
        rawEmoji: rawEmoji.trim(),
        rawSeverity: rawSeverity.trim(),
    };
}

/**
 * Check if a comment author is CodeRabbit
 */
export function isCodeRabbitComment(author: string): boolean {
    return author === 'coderabbitai[bot]' || author === 'coderabbitai';
}
