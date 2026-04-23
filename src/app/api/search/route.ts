import { NextRequest, NextResponse } from 'next/server';
import { FileUseCases } from '@/domain/use-cases';
import { SupabaseFileRepository } from '@/infrastructure/database';
import { ApiResponse } from '@/shared/types';

const fileRepository = new SupabaseFileRepository();
const fileUseCases = new FileUseCases(fileRepository);

interface SearchFilters {
  subject?: string;
  semester?: number;
  type?: string;
  query?: string;
}

/**
 * GET /api/search
 * Search files with filters or natural language query
 * 
 * Query params:
 * - q: Natural language search query
 * - subject: Filter by subject
 * - semester: Filter by semester (number)
 * - type: Filter by file type
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const subject = searchParams.get('subject');
    const semester = searchParams.get('semester');
    const type = searchParams.get('type');

    let results;
    let searchInfo: SearchFilters = {};

    // Natural language search takes priority
    if (query) {
      searchInfo.query = query;
      results = await fileUseCases.searchFilesByNaturalLanguage(query);
    }
    // Structured filters
    else if (subject || semester || type) {
      const filters: SearchFilters = {};
      
      if (subject) {
        filters.subject = subject;
        searchInfo.subject = subject;
      }
      
      if (semester) {
        const semNum = parseInt(semester, 10);
        if (!isNaN(semNum)) {
          filters.semester = semNum;
          searchInfo.semester = semNum;
        }
      }
      
      if (type) {
        filters.type = type;
        searchInfo.type = type;
      }

      results = await fileUseCases.searchFilesByFilters(filters);
    }
    // No filters - return all files
    else {
      results = await fileUseCases.getAllFiles();
    }

    return NextResponse.json({
      data: {
        files: results,
        count: results.length,
        filters: searchInfo,
      },
      message: `Found ${results.length} file${results.length !== 1 ? 's' : ''}`,
    });
  } catch {
    console.error('Search API error');
    return NextResponse.json(
      { error: 'Failed to search files' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search
 * Advanced search with body parameters
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await req.json();
    const { query, subject, semester, type, keywords } = body;

    let results;

    // Natural language search
    if (query && typeof query === 'string') {
      results = await fileUseCases.searchFilesByNaturalLanguage(query);
    }
    // Structured filter search
    else {
      const filters = {
        ...(subject && { subject }),
        ...(semester && { semester: parseInt(semester, 10) }),
        ...(type && { type }),
        ...(keywords && Array.isArray(keywords) && { keywords }),
      };

      results = await fileUseCases.searchFilesByFilters(filters);
    }

    return NextResponse.json({
      data: {
        files: results,
        count: results.length,
      },
      message: `Found ${results.length} file${results.length !== 1 ? 's' : ''}`,
    });
  } catch {
    console.error('Search API error');
    return NextResponse.json(
      { error: 'Failed to search files' },
      { status: 500 }
    );
  }
}
