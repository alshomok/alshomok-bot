import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from '@/lib/config/env';

const SYSTEM_PROMPT = `You are a file metadata extractor for a student document management system.
Analyze the file name and extract the subject, semester, and document type.

Rules:
- Subject: Convert to lowercase, use hyphens for spaces (e.g., "computer-science", "database")
- Semester: Extract number 1-10, null if unclear
- Type: One of: sheet, notes, assignment, exam, pdf, book, lab, project, other

Respond ONLY with valid JSON in this exact format:
{
  "subject": "string or null",
  "semester": number or null,
  "type": "string or null"
}

Examples:
File: "DB_Semester2_CheatSheet.pdf" -> {"subject": "database", "semester": 2, "type": "sheet"}
File: "Physics_Notes_Chapter3.docx" -> {"subject": "physics", "semester": null, "type": "notes"}
File: "Math_Assignment_1.pdf" -> {"subject": "math", "semester": null, "type": "assignment"}
File: "Final_Exam_CS.pdf" -> {"subject": "computer-science", "semester": null, "type": "exam"}`;

export interface FileMetadata {
  subject: string | null;
  semester: number | null;
  type: string | null;
}

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
  }
  return model;
}

export async function extractFileMetadata(fileName: string): Promise<FileMetadata> {
  try {
    const generativeModel = getModel();

    const result = await generativeModel.generateContent(
      `Extract metadata from this file name: "${fileName}"`
    );

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as FileMetadata;

    // Validate and clean
    return {
      subject: parsed.subject?.toLowerCase().replace(/\s+/g, '-') || null,
      semester: typeof parsed.semester === 'number' && parsed.semester >= 1 && parsed.semester <= 10
        ? parsed.semester
        : null,
      type: parsed.type?.toLowerCase() || null,
    };
  } catch (error) {
    console.error('Gemini metadata extraction error:', error);
    // Return null values if extraction fails
    return {
      subject: null,
      semester: null,
      type: null,
    };
  }
}

export function formatMetadataConfirmation(metadata: FileMetadata): string {
  const parts: string[] = [];

  if (metadata.subject) {
    parts.push(`📚 Subject: ${metadata.subject.replace(/-/g, ' ')}`);
  }

  if (metadata.semester) {
    parts.push(`📅 Semester: ${metadata.semester}`);
  }

  if (metadata.type) {
    parts.push(`🏷️ Type: ${metadata.type}`);
  }

  if (parts.length === 0) {
    return '⚠️ Could not extract metadata automatically';
  }

  return parts.join('\n');
}
