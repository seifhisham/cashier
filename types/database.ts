export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price: string; // numeric -> string from Supabase
          category: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_price: string;
          category: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string | null;
          size: string;
          color: string;
          stock_quantity: number;
          price_adjustment: string | null; // numeric -> string
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          size: string;
          color: string;
          stock_quantity?: number;
          price_adjustment?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string | null;
          image_url: string;
          is_primary: boolean | null;
          display_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          image_url: string;
          is_primary?: boolean | null;
          display_order?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          product_id: string | null;
          variant_id: string | null;
          quantity: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          product_id?: string | null;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          guest_email: string | null;
          total_amount: string; // numeric -> string
          status: string | null;
          shipping_address: Json;
          paymob_order_id: string | null;
          paymob_payment_token: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          total_amount: string;
          status?: string | null;
          shipping_address: Json;
          paymob_order_id?: string | null;
          paymob_payment_token?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          product_id: string | null;
          variant_id: string | null;
          quantity: number;
          price_at_purchase: string; // numeric -> string
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          variant_id?: string | null;
          quantity: number;
          price_at_purchase: string;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          role: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
