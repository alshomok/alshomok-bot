'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, MoreHorizontal, Loader2 } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { FileEntity } from '@/domain/entities';

interface FileItem {
  id: string;
  title: string;
  subject: string | null;
  semester: number | null;
  type: string | null;
  fileUrl: string;
  createdAt: string;
}

export function FileSearch() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch files on mount and when search query changes
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = searchQuery
        ? `/api/files?q=${encodeURIComponent(searchQuery)}`
        : '/api/files';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchFiles]);

  const getFileIcon = (type: string | null) => {
    const colors: Record<string, string> = {
      pdf: 'text-red-400',
      docx: 'text-blue-400',
      txt: 'text-gray-400',
      xlsx: 'text-green-400',
      sheet: 'text-yellow-400',
      notes: 'text-purple-400',
      assignment: 'text-orange-400',
      exam: 'text-pink-400',
    };
    return colors[type || ''] || 'text-gray-400';
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
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          File Search
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Search through your study materials and documents
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-6 pb-4">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name or content..."
            className={cn(
              'w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]',
              'py-3 pl-12 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]'
            )}
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium text-red-400">Error</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="space-y-2">
              {files.map((file: FileItem) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={cn(
                    'group flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all',
                    selectedFile?.id === file.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                      : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--input-bg)]',
                      getFileIcon(file.type)
                    )}
                  >
                    <FileText size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-[var(--text-primary)]">
                      {file.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                      {file.subject && <span className="capitalize">{file.subject}</span>}
                      {file.subject && file.semester && <span>•</span>}
                      {file.semester && <span>Semester {file.semester}</span>}
                      {(file.subject || file.semester) && file.type && <span>•</span>}
                      {file.type && <span className="capitalize">{file.type}</span>}
                      <span>•</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>

                  <button className="flex-shrink-0 rounded-lg p-2 text-[var(--text-muted)] opacity-0 transition-opacity hover:bg-[var(--input-bg)] hover:text-[var(--text-primary)] group-hover:opacity-100">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              ))}
            </div>

            {files.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--card-bg)]">
                  <Search size={32} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">
                  No files found
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* File Preview Panel */}
      {selectedFile && (
        <div className="border-t border-[var(--card-border)] bg-[var(--card-bg)] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">
                {selectedFile.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                {selectedFile.subject && <span className="capitalize">{selectedFile.subject}</span>}
                {selectedFile.semester && (
                  <span>• Semester {selectedFile.semester}</span>
                )}
                {selectedFile.type && <span>• {selectedFile.type}</span>}
              </div>
            </div>
            <a
              href={selectedFile.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Open
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
