export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_assessments: {
        Row: {
          assessment_type: string
          confidence_score: number | null
          created_at: string
          id: string
          recommendations: string | null
          results: Json
          session_id: string | null
          user_id: string
        }
        Insert: {
          assessment_type: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          recommendations?: string | null
          results?: Json
          session_id?: string | null
          user_id: string
        }
        Update: {
          assessment_type?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          recommendations?: string | null
          results?: Json
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_assessments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exercise_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_exercises: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: number | null
          duration_seconds: number | null
          exercise_type: string | null
          id: string
          instructions: Json
          patient_id: string | null
          target_joints: Json
          target_reps: number | null
          therapist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          duration_seconds?: number | null
          exercise_type?: string | null
          id?: string
          instructions?: Json
          patient_id?: string | null
          target_joints?: Json
          target_reps?: number | null
          therapist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          duration_seconds?: number | null
          exercise_type?: string | null
          id?: string
          instructions?: Json
          patient_id?: string | null
          target_joints?: Json
          target_reps?: number | null
          therapist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_progression: {
        Row: {
          created_at: string
          current_difficulty_level: number | null
          exercise_id: string
          id: string
          last_updated: string
          progression_rate: number | null
          target_duration: number | null
          target_reps: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_difficulty_level?: number | null
          exercise_id: string
          id?: string
          last_updated?: string
          progression_rate?: number | null
          target_duration?: number | null
          target_reps?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_difficulty_level?: number | null
          exercise_id?: string
          id?: string
          last_updated?: string
          progression_rate?: number | null
          target_duration?: number | null
          target_reps?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_progression_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sessions: {
        Row: {
          accuracy_score: number | null
          completed_at: string
          exercise_id: string
          feedback_notes: string | null
          id: string
          reps_completed: number | null
          session_duration: number | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          completed_at?: string
          exercise_id: string
          feedback_notes?: string | null
          id?: string
          reps_completed?: number | null
          session_duration?: number | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          completed_at?: string
          exercise_id?: string
          feedback_notes?: string | null
          id?: string
          reps_completed?: number | null
          session_duration?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_seconds: number | null
          id: string
          instructions: string[] | null
          position_type: string | null
          target_reps: number | null
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: string
          instructions?: string[] | null
          position_type?: string | null
          target_reps?: number | null
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: string
          instructions?: string[] | null
          position_type?: string | null
          target_reps?: number | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      gait_analysis: {
        Row: {
          analysis_data: Json
          balance_score: number | null
          created_at: string
          id: string
          session_id: string | null
          step_length: number | null
          step_width: number | null
          symmetry_score: number | null
          user_id: string
          walking_speed: number | null
        }
        Insert: {
          analysis_data?: Json
          balance_score?: number | null
          created_at?: string
          id?: string
          session_id?: string | null
          step_length?: number | null
          step_width?: number | null
          symmetry_score?: number | null
          user_id: string
          walking_speed?: number | null
        }
        Update: {
          analysis_data?: Json
          balance_score?: number | null
          created_at?: string
          id?: string
          session_id?: string | null
          step_length?: number | null
          step_width?: number | null
          symmetry_score?: number | null
          user_id?: string
          walking_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gait_analysis_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exercise_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_analysis: {
        Row: {
          balance_metrics: Json | null
          created_at: string
          fatigue_level: number | null
          id: string
          joint_angles: Json
          movement_quality_score: number | null
          pain_indicators: Json | null
          range_of_motion: Json
          session_id: string
          user_id: string
        }
        Insert: {
          balance_metrics?: Json | null
          created_at?: string
          fatigue_level?: number | null
          id?: string
          joint_angles?: Json
          movement_quality_score?: number | null
          pain_indicators?: Json | null
          range_of_motion?: Json
          session_id: string
          user_id: string
        }
        Update: {
          balance_metrics?: Json | null
          created_at?: string
          fatigue_level?: number | null
          id?: string
          joint_angles?: Json
          movement_quality_score?: number | null
          pain_indicators?: Json | null
          range_of_motion?: Json
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_analysis_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exercise_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          first_name: string | null
          hand_dominance: string | null
          id: string
          last_name: string | null
          medical_notes: string | null
          recovery_goals: string[] | null
          severity_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          first_name?: string | null
          hand_dominance?: string | null
          id?: string
          last_name?: string | null
          medical_notes?: string | null
          recovery_goals?: string[] | null
          severity_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          first_name?: string | null
          hand_dominance?: string | null
          id?: string
          last_name?: string | null
          medical_notes?: string | null
          recovery_goals?: string[] | null
          severity_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      speech_sessions: {
        Row: {
          analysis_results: Json | null
          audio_url: string | null
          created_at: string
          fluency_score: number | null
          id: string
          pronunciation_score: number | null
          session_type: string
          speech_clarity_score: number | null
          transcription: string | null
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          audio_url?: string | null
          created_at?: string
          fluency_score?: number | null
          id?: string
          pronunciation_score?: number | null
          session_type: string
          speech_clarity_score?: number | null
          transcription?: string | null
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          audio_url?: string | null
          created_at?: string
          fluency_score?: number | null
          id?: string
          pronunciation_score?: number | null
          session_type?: string
          speech_clarity_score?: number | null
          transcription?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          created_at: string
          exercises: Json | null
          id: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          exercises?: Json | null
          id?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          exercises?: Json | null
          id?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
