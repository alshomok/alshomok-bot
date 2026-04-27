// Browser client - safe for Client Components
export { createClient as createBrowserClient } from './client';

// Server client - ONLY for Server Components and API routes
// Import directly from './server' when needed
// export { createClient as createServerClient } from './server';

// Middleware
export { updateSession } from './middleware';

// Types
export type { Database } from './database.types';
