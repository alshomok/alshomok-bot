export const APP_NAME = 'Student Assistant';
export const APP_DESCRIPTION = 'A platform for students to manage assignments and get assistance';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ASSIGNMENTS: '/assignments',
  SETTINGS: '/settings',
  API: {
    TELEGRAM_WEBHOOK: '/api/telegram/webhook',
    ASSIGNMENTS: '/api/assignments',
    STUDENTS: '/api/students',
  },
} as const;

export const ASSIGNMENT_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;
