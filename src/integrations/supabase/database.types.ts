/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assigned_tasks: {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string | null
          evidence_url: string | null
          follower_id: string
          id: string
          status: string | null
          task_id: string
        }
        Insert: {
          assigned_by: string
          completed_at?: string | null
          created_at?: string | null
          evidence_url?: string | null
          follower_id: string
          id?: string
          status?: string | null
          task_id: string
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string | null
          evidence_url?: string | null
          follower_id?: string
          id?: string
          status?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assigned_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      beat_patterns: {
        Row: {
          bpm: number | null
          created_at: string | null
          creator_id: string
          cult_id: string
          id: string
          name: string
          pattern_data: Json
        }
        Insert: {
          bpm?: number | null
          created_at?: string | null
          creator_id: string
          cult_id: string
          id?: string
          name: string
          pattern_data: Json
        }
        Update: {
          bpm?: number | null
          created_at?: string | null
          creator_id?: string
          cult_id?: string
          id?: string
          name?: string
          pattern_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "beat_patterns_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          created_by: string
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      cults: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          main_deity_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          main_deity_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          main_deity_id?: string | null
          name?: string
        }
        Relationships: []
      }
      fetish_ratings: {
        Row: {
          created_at: string | null
          fetish_id: string
          id: string
          is_starred: boolean | null
          rating: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fetish_id: string
          id?: string
          is_starred?: boolean | null
          rating: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fetish_id?: string
          id?: string
          is_starred?: boolean | null
          rating?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fetish_ratings_fetish_id_fkey"
            columns: ["fetish_id"]
            isOneToOne: false
            referencedRelation: "fetishes"
            referencedColumns: ["id"]
          },
        ]
      }
      fetishes: {
        Row: {
          created_at: string | null
          cult_id: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fetishes_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      hierarchy: {
        Row: {
          created_at: string | null
          cult_id: string
          deity_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          deity_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          deity_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hierarchy_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          code: string
          code_type: string
          created_at: string | null
          creator_id: string
          cult_id: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          code: string
          code_type: string
          created_at?: string | null
          creator_id: string
          cult_id: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          code?: string
          code_type?: string
          created_at?: string | null
          creator_id?: string
          cult_id?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          cult_id: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_main_deity: boolean | null
          role: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          cult_id?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_main_deity?: boolean | null
          role?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          cult_id?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_main_deity?: boolean | null
          role?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      punishments: {
        Row: {
          created_at: string | null
          cult_id: string
          description: string | null
          faith_points_cost: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          description?: string | null
          faith_points_cost?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          description?: string | null
          faith_points_cost?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "punishments_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          created_at: string | null
          cult_id: string
          id: string
          level: number
          name: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          id?: string
          level?: number
          name: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          id?: string
          level?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranks_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          cult_id: string
          description: string | null
          faith_points_cost: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          description?: string | null
          faith_points_cost?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          description?: string | null
          faith_points_cost?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          content: string
          created_at: string | null
          cult_id: string
          id: string
          rule_type: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          cult_id: string
          id?: string
          rule_type: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          cult_id?: string
          id?: string
          rule_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rules_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      session_cards: {
        Row: {
          created_at: string | null
          creator_id: string
          cult_id: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_template: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          cult_id: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_template?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          cult_id?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_template?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_cards_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          cult_id: string
          description: string | null
          faith_points_reward: number | null
          id: string
          requires_evidence: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          description?: string | null
          faith_points_reward?: number | null
          id?: string
          requires_evidence?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          description?: string | null
          faith_points_reward?: number | null
          id?: string
          requires_evidence?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
