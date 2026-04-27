'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Download, Loader2, Filter, X } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileItem {
  id: string;
  title: string;
  subject: string | null;
  semester: number | null;
  type: string | null;
  fileUrl: string;
  createdAt: string;
}

const SUBJECTS = [
  { value: '', label: 'All Subjects' },
  { value: 'database', label: 'Database' },
  { value: 'programming', label: 'Programming' },
  { value: 'math', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'history', label: 'History' },
  { value: 'english', label: 'English' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'network', label: 'Networking' },
  { value: 'security', label: 'Security' },
  { value: 'ai', label: 'AI & ML' },
];

const SEMESTERS = [
  { value: '', label: 'All Semesters' },
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all files
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.data || []);
      setFilteredFiles(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Apply filters
  useEffect(() => {
    let result = files;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (file) =>
          file.title.toLowerCase().includes(query) ||
          file.subject?.toLowerCase().includes(query) ||
          file.type?.toLowerCase().includes(query)
      );
    }

    // Subject filter
    if (selectedSubject) {
      result = result.filter((file) => file.subject === selectedSubject);
    }

    // Semester filter
    if (selectedSemester) {
      result = result.filter((file) => file.semester === parseInt(selectedSemester));
    }

    setFilteredFiles(result);
  }, [files, searchQuery, selectedSubject, selectedSemester]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedSemester('');
  };

  const hasActiveFilters = searchQuery || selectedSubject || selectedSemester;

  const getFileIconColor = (type: string | null) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-500/10 text-red-400',
      docx: 'bg-blue-500/10 text-blue-400',
      txt: 'bg-gray-500/10 text-gray-400',
      xlsx: 'bg-green-500/10 text-green-400',
      sheet: 'bg-yellow-500/10 text-yellow-400',
      notes: 'bg-purple-500/10 text-purple-400',
      assignment: 'bg-orange-500/10 text-orange-400',
      exam: 'bg-pink-500/10 text-pink-400',
    };
    return colors[type || ''] || 'bg-gray-500/10 text-gray-400';
  };

  const getFileExtension = (title: string) => {
    const ext = title.split('.').pop()?.toLowerCase();
    return ext || 'file';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--card-border)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              File Manager
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'border-[var(--accent)] text-[var(--accent)]')}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        className={cn(
          'border-b border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300',
          showFilters ? 'max-h-40 p-4' : 'max-h-0 overflow-hidden'
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          >
            {SEMESTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[var(--accent)]" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-red-500/10 p-4">
              <X size={32} className="text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-red-400">Error loading files</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
        )}

        {!isLoading && !error && filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-[var(--card-bg)] p-4">
              <FileText size={40} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              No files found
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Upload some files to get started'}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredFiles.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 transition-all hover:border-[var(--accent)]/50 hover:shadow-lg"
              >
                {/* Icon & Type */}
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-lg',
                      getFileIconColor(file.type)
                    )}
                  >
                    <FileText size={24} />
                  </div>
                  <span className="rounded-full bg-[var(--input-bg)] px-2 py-1 text-xs font-medium uppercase text-[var(--text-muted)]">
                    {getFileExtension(file.title)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 line-clamp-2 font-medium text-[var(--text-primary)]">
                  {file.title}
                </h3>

                {/* Metadata */}
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  {file.subject && (
                    <span className="rounded-full bg-[var(--accent)]/10 px-2 py-1 capitalize text-[var(--accent)]">
                      {file.subject}
                    </span>
                  )}
                  {file.semester && (
                    <span className="rounded-full bg-[var(--input-bg)] px-2 py-1">
                      Sem {file.semester}
                    </span>
                  )}
                  {file.type && (
                    <span className="rounded-full bg-[var(--input-bg)] px-2 py-1 capitalize">
                      {file.type}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[var(--card-border)] pt-3">
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDate(file.createdAt)}
                  </span>
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
