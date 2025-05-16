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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      movements: {
        Row: {
          arrival_date: string | null
          arrival_time: string | null
          arrival_unit_id: string | null
          created_at: string
          created_by: string
          departure_date: string
          departure_time: string
          departure_unit_id: string
          destination: string | null
          driver: string
          duration: string | null
          final_mileage: number | null
          id: string
          initial_mileage: number
          mileage_run: number | null
          status: Database["public"]["Enums"]["vehicle_location"]
          type: Database["public"]["Enums"]["movement_type"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          arrival_date?: string | null
          arrival_time?: string | null
          arrival_unit_id?: string | null
          created_at?: string
          created_by: string
          departure_date?: string
          departure_time?: string
          departure_unit_id: string
          destination?: string | null
          driver: string
          duration?: string | null
          final_mileage?: number | null
          id?: string
          initial_mileage: number
          mileage_run?: number | null
          status: Database["public"]["Enums"]["vehicle_location"]
          type: Database["public"]["Enums"]["movement_type"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          arrival_date?: string | null
          arrival_time?: string | null
          arrival_unit_id?: string | null
          created_at?: string
          created_by?: string
          departure_date?: string
          departure_time?: string
          departure_unit_id?: string
          destination?: string | null
          driver?: string
          duration?: string | null
          final_mileage?: number | null
          id?: string
          initial_mileage?: number
          mileage_run?: number | null
          status?: Database["public"]["Enums"]["vehicle_location"]
          type?: Database["public"]["Enums"]["movement_type"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movements_arrival_unit_id_fkey"
            columns: ["arrival_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_departure_unit_id_fkey"
            columns: ["departure_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_user_permissions: {
        Row: {
          can_edit_movements: boolean
          can_edit_units: boolean
          can_edit_users: boolean
          can_edit_vehicles: boolean
          can_view_movements: boolean
          can_view_units: boolean
          can_view_users: boolean
          can_view_vehicles: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_edit_movements?: boolean
          can_edit_units?: boolean
          can_edit_users?: boolean
          can_edit_vehicles?: boolean
          can_view_movements?: boolean
          can_view_units?: boolean
          can_view_users?: boolean
          can_view_vehicles?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_edit_movements?: boolean
          can_edit_units?: boolean
          can_edit_users?: boolean
          can_edit_vehicles?: boolean
          can_view_movements?: boolean
          can_view_units?: boolean
          can_view_users?: boolean
          can_view_vehicles?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "system_users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          shift: Database["public"]["Enums"]["user_shift"]
          status: Database["public"]["Enums"]["user_status"]
          unit_id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          shift?: Database["public"]["Enums"]["user_shift"]
          status?: Database["public"]["Enums"]["user_status"]
          unit_id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          shift?: Database["public"]["Enums"]["user_shift"]
          status?: Database["public"]["Enums"]["user_status"]
          unit_id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_users_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_makes: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          created_at: string
          id: string
          make_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          make_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          make_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string
          created_at: string
          id: string
          location: Database["public"]["Enums"]["vehicle_location"]
          make: string
          make_id: string | null
          mileage: number
          model: string
          model_id: string | null
          photo_url: string | null
          plate: string
          unit_id: string
          updated_at: string
          year: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          location?: Database["public"]["Enums"]["vehicle_location"]
          make: string
          make_id?: string | null
          mileage: number
          model: string
          model_id?: string | null
          photo_url?: string | null
          plate: string
          unit_id: string
          updated_at?: string
          year: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          location?: Database["public"]["Enums"]["vehicle_location"]
          make?: string
          make_id?: string | null
          mileage?: number
          model?: string
          model_id?: string | null
          photo_url?: string | null
          plate?: string
          unit_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_users_by_unit: {
        Args: Record<PropertyKey, never>
        Returns: {
          unit_id: string
          count: number
        }[]
      }
      count_vehicles_by_unit: {
        Args: Record<PropertyKey, never>
        Returns: {
          unit_id: string
          count: number
        }[]
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      verify_password: {
        Args: { username: string; password_attempt: string }
        Returns: string
      }
    }
    Enums: {
      movement_type: "entry" | "exit" | "initial"
      user_role: "admin" | "operator"
      user_shift: "day" | "night"
      user_status: "active" | "inactive"
      vehicle_location: "yard" | "out"
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
    Enums: {
      movement_type: ["entry", "exit", "initial"],
      user_role: ["admin", "operator"],
      user_shift: ["day", "night"],
      user_status: ["active", "inactive"],
      vehicle_location: ["yard", "out"],
    },
  },
} as const
