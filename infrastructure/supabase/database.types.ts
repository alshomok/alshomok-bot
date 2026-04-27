export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          telegram_id: string | null;
          email: string | null;
          full_name: string;
          student_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telegram_id?: string | null;
          email?: string | null;
          full_name: string;
          student_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: string | null;
          email?: string | null;
          full_name?: string;
          student_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          student_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          status: 'pending' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: 'pending' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: 'pending' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          subject: string | null;
          semester: number | null;
          type: string | null;
          file_url: string;
          storage_path: string | null;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          subject?: string | null;
          semester?: number | null;
          type?: string | null;
          file_url: string;
          storage_path?: string | null;
          size_bytes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          subject?: string | null;
          semester?: number | null;
          type?: string | null;
          file_url?: string;
          storage_path?: string | null;
          size_bytes?: number | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          telegram_id: string | null;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          monthly_upload_bytes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          telegram_id?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          monthly_upload_bytes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          telegram_id?: string | null;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          monthly_upload_bytes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          requests_count: number;
          window_start: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          requests_count?: number;
          window_start?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          requests_count?: number;
          window_start?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          conversation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          conversation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          conversation_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
