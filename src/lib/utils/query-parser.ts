export interface ParsedQuery {
  subject?: string;
  semester?: number;
  type?: string;
  keywords?: string[];
}

const SUBJECT_MAPPINGS: Record<string, string[]> = {
  database: ['database', 'db', 'sql', 'mysql', 'postgresql', 'mongo', 'nosql'],
  programming: ['programming', 'coding', 'code', 'dev', 'development', 'software'],
  math: ['math', 'mathematics', 'calculus', 'algebra', 'geometry', 'statistics'],
  physics: ['physics', 'physic', 'mechanics', 'thermodynamics', 'quantum'],
  chemistry: ['chemistry', 'chem', 'organic', 'inorganic', 'biochemistry'],
  biology: ['biology', 'bio', 'biological', 'genetics', 'microbiology'],
  history: ['history', 'historical', 'civilization', 'ancient'],
  english: ['english', 'literature', 'grammar', 'writing', 'composition'],
  'computer-science': ['computer science', 'cs', 'algorithms', 'data structures', 'computing'],
  network: ['network', 'networking', 'ccna', 'tcp/ip', 'protocols'],
  security: ['security', 'cybersecurity', 'infosec', 'encryption', 'cryptography'],
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural networks'],
};

const TYPE_MAPPINGS: Record<string, string[]> = {
  sheet: ['sheet', 'sheets', 'cheat sheet', 'reference sheet'],
  notes: ['notes', 'note', 'lecture notes', 'class notes'],
  assignment: ['assignment', 'homework', 'hw', 'task', 'exercise'],
  exam: ['exam', 'exams', 'quiz', 'test', 'midterm', 'final'],
  pdf: ['pdf', 'document', 'doc'],
  presentation: ['presentation', 'ppt', 'powerpoint', 'slides'],
  book: ['book', 'textbook', 'ebook', 'reference'],
  lab: ['lab', 'laboratory', 'experiment', 'practical'],
  project: ['project', 'projects', 'final project'],
};

export function parseNaturalLanguageQuery(input: string): ParsedQuery {
  const normalized = input.toLowerCase().trim();
  const result: ParsedQuery = {
    keywords: [],
  };

  // Extract semester
  const semesterMatch = normalized.match(/semester\s*(\d+)|term\s*(\d+)|season\s*(\d+)|(\d+)(?:st|nd|rd|th)?\s*semester/i);
  if (semesterMatch) {
    const semester = parseInt(semesterMatch[1] || semesterMatch[2] || semesterMatch[3] || semesterMatch[4], 10);
    if (!isNaN(semester) && semester >= 1 && semester <= 10) {
      result.semester = semester;
    }
  }

  // Extract subject
  for (const [subjectKey, aliases] of Object.entries(SUBJECT_MAPPINGS)) {
    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        result.subject = subjectKey;
        break;
      }
    }
    if (result.subject) break;
  }

  // Extract type
  for (const [typeKey, aliases] of Object.entries(TYPE_MAPPINGS)) {
    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        result.type = typeKey;
        break;
      }
    }
    if (result.type) break;
  }

  // Extract remaining keywords (words that aren't stop words and aren't already captured)
  const stopWords = ['i', 'want', 'need', 'looking', 'for', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'with', 'by', 'this', 'that', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall'];
  
  const words = normalized
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word));

  // Filter out words that are part of already identified entities
  const usedWords = [
    ...(result.subject ? SUBJECT_MAPPINGS[result.subject] : []),
    ...(result.type ? TYPE_MAPPINGS[result.type] : []),
  ].flat();

  result.keywords = words.filter((word) => !usedWords.some((used) => used.includes(word)));

  return result;
}

export function buildSearchFilters(parsed: ParsedQuery): Record<string, unknown> {
  const filters: Record<string, unknown> = {};

  if (parsed.subject) {
    filters.subject = parsed.subject;
  }

  if (parsed.semester) {
    filters.semester = parsed.semester;
  }

  if (parsed.type) {
    filters.type = parsed.type;
  }

  if (parsed.keywords && parsed.keywords.length > 0) {
    filters.keywords = parsed.keywords;
  }

  return filters;
}
