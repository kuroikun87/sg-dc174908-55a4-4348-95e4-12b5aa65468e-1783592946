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
      active_sessions: {
        Row: {
          card_duration_seconds: number | null
          card_show_timer: boolean | null
          card_started_at: string | null
          created_at: string | null
          cult_id: string
          current_card_id: string | null
          current_rpm: number | null
          deity_id: string
          follower_ids: string[]
          id: string
          is_active: boolean | null
          is_muted_for_deity: boolean | null
          is_playing: boolean | null
          manual_beat_trigger: string | null
          updated_at: string | null
        }
        Insert: {
          card_duration_seconds?: number | null
          card_show_timer?: boolean | null
          card_started_at?: string | null
          created_at?: string | null
          cult_id: string
          current_card_id?: string | null
          current_rpm?: number | null
          deity_id: string
          follower_ids: string[]
          id?: string
          is_active?: boolean | null
          is_muted_for_deity?: boolean | null
          is_playing?: boolean | null
          manual_beat_trigger?: string | null
          updated_at?: string | null
        }
        Update: {
          card_duration_seconds?: number | null
          card_show_timer?: boolean | null
          card_started_at?: string | null
          created_at?: string | null
          cult_id?: string
          current_card_id?: string | null
          current_rpm?: number | null
          deity_id?: string
          follower_ids?: string[]
          id?: string
          is_active?: boolean | null
          is_muted_for_deity?: boolean | null
          is_playing?: boolean | null
          manual_beat_trigger?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
        ]
      }
      assigned_punishments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          follower_id: string
          id: string
          is_removed: boolean | null
          notes: string | null
          punishment_id: string
          removed_at: string | null
          removed_by: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          follower_id: string
          id?: string
          is_removed?: boolean | null
          notes?: string | null
          punishment_id: string
          removed_at?: string | null
          removed_by?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          follower_id?: string
          id?: string
          is_removed?: boolean | null
          notes?: string | null
          punishment_id?: string
          removed_at?: string | null
          removed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assigned_punishments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_punishments_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_punishments_punishment_id_fkey"
            columns: ["punishment_id"]
            isOneToOne: false
            referencedRelation: "punishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_punishments_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assigned_tasks: {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string | null
          deity_timezone: string | null
          due_date: string | null
          evidence_url: string | null
          follower_id: string
          follower_timezone: string | null
          id: string
          punishment_faith_points: number | null
          punishment_id: string | null
          reward_faith_points: number | null
          reward_id: string | null
          status: string | null
          task_id: string
        }
        Insert: {
          assigned_by: string
          completed_at?: string | null
          created_at?: string | null
          deity_timezone?: string | null
          due_date?: string | null
          evidence_url?: string | null
          follower_id: string
          follower_timezone?: string | null
          id?: string
          punishment_faith_points?: number | null
          punishment_id?: string | null
          reward_faith_points?: number | null
          reward_id?: string | null
          status?: string | null
          task_id: string
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string | null
          deity_timezone?: string | null
          due_date?: string | null
          evidence_url?: string | null
          follower_id?: string
          follower_timezone?: string | null
          id?: string
          punishment_faith_points?: number | null
          punishment_id?: string | null
          reward_faith_points?: number | null
          reward_id?: string | null
          status?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assigned_tasks_punishment_id_fkey"
            columns: ["punishment_id"]
            isOneToOne: false
            referencedRelation: "punishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_tasks_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      awarded_rewards: {
        Row: {
          awarded_at: string | null
          awarded_by: string
          follower_id: string
          id: string
          is_redeemed: boolean | null
          notes: string | null
          redeemed_at: string | null
          reward_id: string
        }
        Insert: {
          awarded_at?: string | null
          awarded_by: string
          follower_id: string
          id?: string
          is_redeemed?: boolean | null
          notes?: string | null
          redeemed_at?: string | null
          reward_id: string
        }
        Update: {
          awarded_at?: string | null
          awarded_by?: string
          follower_id?: string
          id?: string
          is_redeemed?: boolean | null
          notes?: string | null
          redeemed_at?: string | null
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "awarded_rewards_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awarded_rewards_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awarded_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
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
      faith_points_log: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          deity_id: string | null
          id: string
          reason: string
          related_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          deity_id?: string | null
          id?: string
          reason: string
          related_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          deity_id?: string | null
          id?: string
          reason?: string
          related_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      favor_points: {
        Row: {
          deity_id: string
          follower_id: string
          id: string
          points: number
          updated_at: string | null
        }
        Insert: {
          deity_id: string
          follower_id: string
          id?: string
          points?: number
          updated_at?: string | null
        }
        Update: {
          deity_id?: string
          follower_id?: string
          id?: string
          points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favor_points_deity_id_fkey"
            columns: ["deity_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favor_points_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          cult_id: string | null
          display_name: string | null
          email: string | null
          faith_points: number
          full_name: string | null
          id: string
          is_main_deity: boolean | null
          nickname: string | null
          pronouns: string | null
          rank_id: string | null
          role: string | null
          timezone: string | null
          title: string | null
          title_locked_by: string | null
          title_locked_until: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          cult_id?: string | null
          display_name?: string | null
          email?: string | null
          faith_points?: number
          full_name?: string | null
          id: string
          is_main_deity?: boolean | null
          nickname?: string | null
          pronouns?: string | null
          rank_id?: string | null
          role?: string | null
          timezone?: string | null
          title?: string | null
          title_locked_by?: string | null
          title_locked_until?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          cult_id?: string | null
          display_name?: string | null
          email?: string | null
          faith_points?: number
          full_name?: string | null
          id?: string
          is_main_deity?: boolean | null
          nickname?: string | null
          pronouns?: string | null
          rank_id?: string | null
          role?: string | null
          timezone?: string | null
          title?: string | null
          title_locked_by?: string | null
          title_locked_until?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      punishments: {
        Row: {
          created_at: string | null
          cult_id: string
          description: string | null
          faith_points_cost: number | null
          id: string
          is_active: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          description?: string | null
          faith_points_cost?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          description?: string | null
          faith_points_cost?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
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
          exclusive_to: string | null
          faith_points_cost: number | null
          favor_points_required: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_exclusive: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          description?: string | null
          exclusive_to?: string | null
          faith_points_cost?: number | null
          favor_points_required?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_exclusive?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          description?: string | null
          exclusive_to?: string | null
          faith_points_cost?: number | null
          favor_points_required?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_exclusive?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_cult_id_fkey"
            columns: ["cult_id"]
            isOneToOne: false
            referencedRelation: "cults"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_exclusive_to_fkey"
            columns: ["exclusive_to"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      session_audios: {
        Row: {
          audio_url: string
          created_at: string | null
          creator_id: string
          cult_id: string
          duration_seconds: number
          id: string
          name: string
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          creator_id: string
          cult_id: string
          duration_seconds: number
          id?: string
          name: string
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          creator_id?: string
          cult_id?: string
          duration_seconds?: number
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_audios_cult_id_fkey"
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
          recurrence_days: number[] | null
          recurrence_type: string | null
          requires_evidence: boolean | null
          time_limit: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          cult_id: string
          description?: string | null
          faith_points_reward?: number | null
          id?: string
          recurrence_days?: number[] | null
          recurrence_type?: string | null
          requires_evidence?: boolean | null
          time_limit?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          cult_id?: string
          description?: string | null
          faith_points_reward?: number | null
          id?: string
          recurrence_days?: number[] | null
          recurrence_type?: string | null
          requires_evidence?: boolean | null
          time_limit?: string | null
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
      log_faith_points_transaction: {
        Args: {
          p_amount: number
          p_deity_id: string
          p_reason: string
          p_related_id?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      purchase_reward: {
        Args: { p_follower_id: string; p_reward_id: string }
        Returns: Json
      }
      remove_punishment: {
        Args: { p_assigned_punishment_id: string; p_follower_id: string }
        Returns: Json
      }
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
