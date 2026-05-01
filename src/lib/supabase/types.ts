export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      novels: {
        Row: {
          id: string;
          title: string;
          slug: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          slug: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      scenes: {
        Row: {
          id: string;
          novel_id: string;
          title: string;
          order_index: number;
          metadata_json: Json;
        };
        Insert: {
          id: string;
          novel_id: string;
          title: string;
          order_index: number;
          metadata_json?: Json;
        };
        Update: {
          id?: string;
          novel_id?: string;
          title?: string;
          order_index?: number;
          metadata_json?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "scenes_novel_id_fkey";
            columns: ["novel_id"];
            isOneToOne: false;
            referencedRelation: "novels";
            referencedColumns: ["id"];
          },
        ];
      };
      beats: {
        Row: {
          id: string;
          scene_id: string;
          order_index: number;
          text: string;
          speaker: string;
          resonance_weights_json: Json;
          hyper_prompts_json: Json;
          choices_json: Json;
        };
        Insert: {
          id: string;
          scene_id: string;
          order_index: number;
          text: string;
          speaker: string;
          resonance_weights_json: Json;
          hyper_prompts_json: Json;
          choices_json?: Json;
        };
        Update: {
          id?: string;
          scene_id?: string;
          order_index?: number;
          text?: string;
          speaker?: string;
          resonance_weights_json?: Json;
          hyper_prompts_json?: Json;
          choices_json?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "beats_scene_id_fkey";
            columns: ["scene_id"];
            isOneToOne: false;
            referencedRelation: "scenes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_story_archive: {
        Args: {
          p_novel: Json;
          p_scenes: Json;
          p_beats: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type NovelRow = Database["public"]["Tables"]["novels"]["Row"];
export type SceneRow = Database["public"]["Tables"]["scenes"]["Row"];
export type BeatRow = Database["public"]["Tables"]["beats"]["Row"];
export type NovelInsert = Database["public"]["Tables"]["novels"]["Insert"];
export type SceneInsert = Database["public"]["Tables"]["scenes"]["Insert"];
export type BeatInsert = Database["public"]["Tables"]["beats"]["Insert"];
