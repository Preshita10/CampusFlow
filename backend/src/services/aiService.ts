/**
 * AI Service for request classification and summarization
 * MVP: Rule-based implementation
 * Optional: LLM-based when OPENAI_API_KEY is provided
 */

interface ClassificationResult {
  category: string;
  confidence: number;
}

/**
 * Rule-based classification using keyword matching
 * Maps request content to predefined categories
 */
export function classifyRequest(title: string, description: string): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();

  // Keyword mappings for different categories
  const categoryKeywords: Record<string, string[]> = {
    COURSE_OVERRIDE: ['override', 'permission', 'prereq', 'prerequisite', 'waiver'],
    ADD_DROP: ['add', 'drop', 'late', 'withdraw', 'enrollment'],
    GRADUATION_AUDIT: ['graduation', 'audit', 'degree', 'requirements', 'credits'],
    RECOMMENDATION: ['recommendation', 'letter', 'reference', 'recommend'],
    FUNDING: ['fund', 'financial', 'aid', 'scholarship', 'grant', 'tuition'],
    GENERAL: [],
  };

  // Count matches for each category
  const scores: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = keywords.reduce((count, keyword) => {
      return count + (text.includes(keyword) ? 1 : 0);
    }, 0);
  }

  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores));
  const bestCategory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'GENERAL';

  // Calculate confidence (0-1 scale)
  const totalKeywords = Object.values(categoryKeywords).flat().length;
  const confidence = maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.3; // Cap at 1, min 0.3 for GENERAL

  return {
    category: bestCategory,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Generate extractive summary from request and comments
 * Creates a 4-6 line summary covering key aspects
 */
export function summarizeThread(
  title: string,
  description: string,
  status: string,
  assigneeName: string | null,
  comments: Array<{ message: string; authorName: string; createdAt: Date }>
): string {
  const lines: string[] = [];

  // Line 1: Request intent
  const intent = description.length > 100 ? description.substring(0, 100) + '...' : description;
  lines.push(`Request: ${title} - ${intent}`);

  // Line 2: Current status and assignee
  const assigneeInfo = assigneeName ? `assigned to ${assigneeName}` : 'unassigned';
  lines.push(`Status: ${status} (${assigneeInfo})`);

  // Line 3: Extract course codes if present (common pattern: CS 662, MATH 101, etc.)
  const courseCodeMatch = description.match(/\b([A-Z]{2,4}\s*\d{3,4})\b/);
  if (courseCodeMatch) {
    lines.push(`Course: ${courseCodeMatch[1]}`);
  }

  // Line 4: Key details (first 80 chars of description)
  const keyDetails = description.substring(0, 80).replace(/\n/g, ' ').trim();
  if (keyDetails) {
    lines.push(`Details: ${keyDetails}${description.length > 80 ? '...' : ''}`);
  }

  // Line 5-6: Last comment snapshot if available
  if (comments.length > 0) {
    const lastComment = comments[comments.length - 1];
    const commentPreview = lastComment.message.substring(0, 60).replace(/\n/g, ' ').trim();
    lines.push(`Latest: ${lastComment.authorName} - ${commentPreview}${lastComment.message.length > 60 ? '...' : ''}`);
  }

  return lines.join('\n');
}

/**
 * Optional: LLM-based classification using OpenAI
 * Falls back to rule-based if API key not available
 */
export async function classifyRequestWithLLM(
  title: string,
  description: string,
  apiKey?: string
): Promise<ClassificationResult> {
  if (!apiKey) {
    return classifyRequest(title, description);
  }

  try {
    // This would call OpenAI API in production
    // For MVP, we'll keep it rule-based but structure it for future enhancement
    // Uncomment and implement when ready:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: 'Classify academic requests into: COURSE_OVERRIDE, ADD_DROP, GRADUATION_AUDIT, RECOMMENDATION, FUNDING, GENERAL'
        }, {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}`
        }],
        temperature: 0.3,
      }),
    });
    // Parse response and return category
    */
    return classifyRequest(title, description);
  } catch (error) {
    console.error('LLM classification failed, falling back to rule-based:', error);
    return classifyRequest(title, description);
  }
}
