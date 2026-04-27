'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  FolderOpen,
  Plus,
  ChevronLeft,
  Menu,
  GraduationCap,
} from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Chat', href: '/', icon: MessageSquare },
  { name: 'Files', href: '/files', icon: FolderOpen },
];

const recentChats = [
  { id: '1', title: 'Assignment Help' },
  { id: '2', title: 'Study Notes Analysis' },
  { id: '3', title: 'Exam Preparation' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
          <GraduationCap size={18} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-[var(--text-primary)]">Student AI</span>
        )}
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-2">
        <button className="flex w-full items-center gap-3 rounded-lg border border-[var(--sidebar-border)] bg-transparent px-3 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--sidebar-border)]">
          <Plus size={18} />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-border)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Recent Chats - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="flex-1 px-3 py-4">
          <h3 className="mb-2 px-3 text-xs font-medium text-[var(--text-muted)]">
            Recent
          </h3>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--sidebar-border)] hover:text-[var(--text-primary)]"
              >
                <MessageSquare size={16} />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapse Toggle - Desktop only */}
      <div className="hidden border-t border-[var(--sidebar-border)] p-3 lg:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-border)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeft
            size={18}
            className={cn('transition-transform', isCollapsed && 'rotate-180')}
          />
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sidebar-bg)] text-[var(--text-primary)] lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-all duration-300',
          'lg:relative',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
