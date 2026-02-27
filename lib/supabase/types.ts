export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          ended_at: string;
          duration_min: number;
          exam: 'yobi' | 'shiho' | 'both';
          track: 'tantou' | 'ronbun' | 'review' | 'mock' | 'other';
          subject: string;
          material: string | null;
          activity: 'input' | 'drill' | 'review' | 'write';
          confidence: number | null;
          memo: string | null;
          notes: string | null;
          cause_category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at: string;
          ended_at: string;
          duration_min: number;
          exam: 'yobi' | 'shiho' | 'both';
          track: 'tantou' | 'ronbun' | 'review' | 'mock' | 'other';
          subject: string;
          material?: string | null;
          activity: 'input' | 'drill' | 'review' | 'write';
          confidence?: number | null;
          memo?: string | null;
          notes?: string | null;
          cause_category?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['study_sessions']['Insert']>;
      };
      weekly_plans: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          target_min: number;
          ratios: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          target_min: number;
          ratios?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weekly_plans']['Insert']>;
      };
      pomodoro_runs: {
        Row: {
          id: string;
          user_id: string;
          study_session_id: string | null;
          work_min: number;
          break_min: number;
          cycles: number;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_session_id?: string | null;
          work_min: number;
          break_min: number;
          cycles: number;
          started_at: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pomodoro_runs']['Insert']>;
      };
      essay_templates: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          title: string;
          template: string | null;
          norm: string | null;
          pitfall: string | null;
          rank: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          title: string;
          template?: string | null;
          norm?: string | null;
          pitfall?: string | null;
          rank?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['essay_templates']['Insert']>;
      };
      legal_concepts: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          category: string;
          title: string;
          summary: string | null;
          framework: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          category?: string;
          title: string;
          summary?: string | null;
          framework?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['legal_concepts']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
