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
      assignments: {
        Row: {
          assignee_id: string
          assigner_id: string | null
          completed_at: string | null
          created_at: string | null
          custom_description: string | null
          custom_faith_points: number | null
          custom_name: string | null
          evidence_image_url: string | null
          id: string
          notes: string | null
          reference_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          assignee_id: string
          assigner_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          custom_description?: string | null
          custom_faith_points?: number | null
          custom_name?: string | null
          evidence_image_url?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          assignee_id?: string
          assigner_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          custom_description?: string | null
          custom_faith_points?: number | null
          custom_name?: string | null
          evidence_image_url?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_assigner_id_fkey"
            columns: ["assigner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beat_patterns: {
        Row: {
          bpm: number | null
          created_at: string | null
          creator_id: string
          id: string
          name: string
          pattern: Json
        }
        Insert: {
          bpm?: number | null
          created_at?: string | null
          creator_id: string
          id?: string
          name: string
          pattern: Json
        }
        Update: {
          bpm?: number | null
          created_at?: string | null
          creator_id?: string
          id?: string
          name?: string
          pattern?: Json
        }
        Relationships: [
          {
            foreignKeyName: "beat_patterns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          is_editable_by_owner: boolean | null
          notify_deity: boolean | null
          notify_follower: boolean | null
          owner_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          is_editable_by_owner?: boolean | null
          notify_deity?: boolean | null
          notify_follower?: boolean | null
          owner_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_editable_by_owner?: boolean | null
          notify_deity?: boolean | null
          notify_follower?: boolean | null
          owner_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consequences: {
        Row: {
          created_at: string | null
          created_by: string | null
          cult_id: string
          description: string | null
          faith_points_remove: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cult_id: string
          description?: string | null
          faith_points_remove?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cult_id?: string
          description?: string | null
          faith_points_remove?: number
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "consequences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consequences_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      cults: {
        Row: {
          created_at: string | null
          deity_invite_code: string | null
          description: string | null
          follower_invite_code: string | null
          id: string
          image_url: string | null
          main_deity_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deity_invite_code?: string | null
          description?: string | null
          follower_invite_code?: string | null
          id?: string
          image_url?: string | null
          main_deity_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deity_invite_code?: string | null
          description?: string | null
          follower_invite_code?: string | null
          id?: string
          image_url?: string | null
          main_deity_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cults_main_deity_id_fkey"
            columns: ["main_deity_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fetish_reactions: {
        Row: {
          created_at: string | null
          fetish_id: string
          follower_id: string
          id: string
          is_starred: boolean | null
          reaction: string
        }
        Insert: {
          created_at?: string | null
          fetish_id: string
          follower_id: string
          id?: string
          is_starred?: boolean | null
          reaction: string
        }
        Update: {
          created_at?: string | null
          fetish_id?: string
          follower_id?: string
          id?: string
          is_starred?: boolean | null
          reaction?: string
        }
        Relationships: [
          {
            foreignKeyName: "fetish_reactions_fetish_id_fkey"
            columns: ["fetish_id"]
            isOneToOne: false
            referencedRelation: "fetishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fetish_reactions_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fetishes: {
        Row: {
          created_at: string | null
          created_by: string | null
          cult_id: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cult_id: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cult_id?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fetishes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          assigned_by: string | null
          created_at: string | null
          cult_id: string
          id: string
          subordinate_id: string
          superior_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          cult_id: string
          id?: string
          subordinate_id: string
          superior_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          cult_id?: string
          id?: string
          subordinate_id?: string
          superior_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hierarchy_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hierarchy_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hierarchy_subordinate_id_fkey"
            columns: ["subordinate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hierarchy_superior_id_fkey"
            columns: ["superior_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          code: string
          created_at: string | null
          creator_id: string
          cult_id: string
          id: string
          is_active: boolean | null
          max_uses: number | null
          type: string
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          creator_id: string
          cult_id: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          type: string
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          creator_id?: string
          cult_id?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          type?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          is_personal: boolean | null
          owner_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_personal?: boolean | null
          owner_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_personal?: boolean | null
          owner_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          cult_id: string | null
          display_name: string | null
          email: string | null
          faith_points: number | null
          full_name: string | null
          id: string
          invitation_code_used: string | null
          invited_by: string | null
          rank_id: string | null
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
          faith_points?: number | null
          full_name?: string | null
          id: string
          invitation_code_used?: string | null
          invited_by?: string | null
          rank_id?: string | null
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
          faith_points?: number | null
          full_name?: string | null
          id?: string
          invitation_code_used?: string | null
          invited_by?: string | null
          rank_id?: string | null
          role?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          created_at: string | null
          cult_id: string
          id: string
          is_default: boolean | null
          level: number
          name: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          id?: string
          is_default?: boolean | null
          level?: number
          name: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          id?: string
          is_default?: boolean | null
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
          created_by: string | null
          cult_id: string
          description: string | null
          faith_points_cost: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cult_id: string
          description?: string | null
          faith_points_cost?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cult_id?: string
          description?: string | null
          faith_points_cost?: number
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          created_by: string | null
          cult_id: string
          id: string
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          cult_id: string
          id?: string
          title: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          cult_id?: string
          id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          category: string | null
          created_at: string | null
          creator_id: string | null
          cult_id: string | null
          description: string | null
          id: string
          is_predefined: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          cult_id?: string | null
          description?: string | null
          id?: string
          is_predefined?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          cult_id?: string | null
          description?: string | null
          id?: string
          is_predefined?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_cards_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_cards_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      session_messages: {
        Row: {
          audio_url: string
          created_at: string | null
          duration: number | null
          id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          duration?: number | null
          id?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          duration?: number | null
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          created_by: string | null
          cult_id: string
          description: string | null
          evidence_image_url: string | null
          faith_points_reward: number
          id: string
          name: string
          requires_evidence: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cult_id: string
          description?: string | null
          evidence_image_url?: string | null
          faith_points_reward?: number
          id?: string
          name: string
          requires_evidence?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cult_id?: string
          description?: string | null
          evidence_image_url?: string | null
          faith_points_reward?: number
          id?: string
          name?: string
          requires_evidence?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
