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
      announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          apartment_id: string | null
          audience: string
          author_id: string | null
          body: string
          created_at: string
          id: string
          pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          apartment_id?: string | null
          audience?: string
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          apartment_id?: string | null
          audience?: string
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      apartment_payout_config: {
        Row: {
          active: boolean
          apartment_id: string
          created_at: string
          id: string
          notes: string | null
          owner_id: string
          payout_type: string
          payout_value: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          apartment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          owner_id: string
          payout_type?: string
          payout_value?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          apartment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          owner_id?: string
          payout_type?: string
          payout_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      apartments: {
        Row: {
          active: boolean
          address: string | null
          amenities: string[] | null
          cep: string | null
          city: string | null
          code: string | null
          complement: string | null
          cover_photo_url: string | null
          created_at: string
          description: string | null
          gender: Database["public"]["Enums"]["house_gender"]
          house_type: string | null
          id: string
          name: string
          neighborhood: string
          number: string | null
          owner_id: string | null
          photos: string[] | null
          videos: string[] | null
          rules: string | null
          state: string | null
          status: Database["public"]["Enums"]["apartment_status"]
          street: string | null
          updated_at: string
          vibe: string[] | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          amenities?: string[] | null
          cep?: string | null
          city?: string | null
          code?: string | null
          complement?: string | null
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["house_gender"]
          house_type?: string | null
          id?: string
          name: string
          neighborhood: string
          number?: string | null
          owner_id?: string | null
          photos?: string[] | null
          videos?: string[] | null
          rules?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["apartment_status"]
          street?: string | null
          updated_at?: string
          vibe?: string[] | null
        }
        Update: {
          active?: boolean
          address?: string | null
          amenities?: string[] | null
          cep?: string | null
          city?: string | null
          code?: string | null
          complement?: string | null
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["house_gender"]
          house_type?: string | null
          id?: string
          name?: string
          neighborhood?: string
          number?: string | null
          owner_id?: string | null
          photos?: string[] | null
          videos?: string[] | null
          rules?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["apartment_status"]
          street?: string | null
          updated_at?: string
          vibe?: string[] | null
        }
        Relationships: []
      }
      application_history: {
        Row: {
          actor_id: string | null
          application_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor_id?: string | null
          application_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor_id?: string | null
          application_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "application_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          age: number | null
          answers: Json | null
          budget_max: number | null
          cep: string | null
          city: string | null
          complement: string | null
          created_at: string
          document_path: string | null
          document_type: string | null
          email: string
          full_name: string
          gender_preference: Database["public"]["Enums"]["house_gender"] | null
          id: string
          lifestyle: Json | null
          move_in_date: string | null
          neighborhood: string | null
          notes: string | null
          number: string | null
          occupation: string | null
          phone: string | null
          score: number | null
          state: string | null
          status: Database["public"]["Enums"]["application_status"]
          stay_months: number | null
          street: string | null
          suggested_room_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          answers?: Json | null
          budget_max?: number | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document_path?: string | null
          document_type?: string | null
          email: string
          full_name: string
          gender_preference?: Database["public"]["Enums"]["house_gender"] | null
          id?: string
          lifestyle?: Json | null
          move_in_date?: string | null
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          occupation?: string | null
          phone?: string | null
          score?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          stay_months?: number | null
          street?: string | null
          suggested_room_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          answers?: Json | null
          budget_max?: number | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document_path?: string | null
          document_type?: string | null
          email?: string
          full_name?: string
          gender_preference?: Database["public"]["Enums"]["house_gender"] | null
          id?: string
          lifestyle?: Json | null
          move_in_date?: string | null
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          occupation?: string | null
          phone?: string | null
          score?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          stay_months?: number | null
          street?: string | null
          suggested_room_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_suggested_room_id_fkey"
            columns: ["suggested_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          apartment_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          starts_at: string
          title: string
        }
        Insert: {
          apartment_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          starts_at: string
          title: string
        }
        Update: {
          apartment_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_tips: {
        Row: {
          apartment_id: string | null
          author_id: string | null
          body: string
          category: string | null
          created_at: string
          id: string
          title: string
        }
        Insert: {
          apartment_id?: string | null
          author_id?: string | null
          body: string
          category?: string | null
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          apartment_id?: string | null
          author_id?: string | null
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_tips_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_addendums: {
        Row: {
          contract_id: string
          created_at: string
          created_by: string | null
          description: string
          document_id: string | null
          effective_date: string | null
          id: string
          kind: Database["public"]["Enums"]["contract_addendum_kind"]
          status: Database["public"]["Enums"]["contract_addendum_status"]
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          created_by?: string | null
          description: string
          document_id?: string | null
          effective_date?: string | null
          id?: string
          kind: Database["public"]["Enums"]["contract_addendum_kind"]
          status?: Database["public"]["Enums"]["contract_addendum_status"]
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          document_id?: string | null
          effective_date?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["contract_addendum_kind"]
          status?: Database["public"]["Enums"]["contract_addendum_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_addendums_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "contract_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_billing_rules: {
        Row: {
          contract_id: string
          created_at: string
          daily_interest_pct: number
          grace_days: number
          late_fee_type: string
          late_fee_value: number
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          daily_interest_pct?: number
          grace_days?: number
          late_fee_type?: string
          late_fee_value?: number
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          daily_interest_pct?: number
          grace_days?: number
          late_fee_type?: string
          late_fee_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      contract_checklist_items: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          contract_id: string
          created_at: string
          id: string
          kind: string
          label: string
          required: boolean
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          contract_id: string
          created_at?: string
          id?: string
          kind: string
          label: string
          required?: boolean
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          kind?: string
          label?: string
          required?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      contract_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content_rendered: string
          contract_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["contract_template_kind"]
          notes: string | null
          pdf_path: string | null
          sent_at: string | null
          signed_at: string | null
          signed_by_ip: string | null
          status: Database["public"]["Enums"]["contract_document_status"]
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content_rendered?: string
          contract_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["contract_template_kind"]
          notes?: string | null
          pdf_path?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_by_ip?: string | null
          status?: Database["public"]["Enums"]["contract_document_status"]
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content_rendered?: string
          contract_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["contract_template_kind"]
          notes?: string | null
          pdf_path?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_by_ip?: string | null
          status?: Database["public"]["Enums"]["contract_document_status"]
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          active: boolean
          content: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["contract_template_kind"]
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["contract_template_kind"]
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["contract_template_kind"]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          apartment_id: string | null
          application_id: string | null
          auto_renewal: boolean
          created_at: string
          deposit_value: number | null
          end_date: string | null
          id: string
          monthly_value: number
          notes: string | null
          owner_id: string | null
          pdf_main_document_id: string | null
          renewal_alert_sent_at: string | null
          room_id: string
          signed_at: string | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          apartment_id?: string | null
          application_id?: string | null
          auto_renewal?: boolean
          created_at?: string
          deposit_value?: number | null
          end_date?: string | null
          id?: string
          monthly_value: number
          notes?: string | null
          owner_id?: string | null
          pdf_main_document_id?: string | null
          renewal_alert_sent_at?: string | null
          room_id: string
          signed_at?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          apartment_id?: string | null
          application_id?: string | null
          auto_renewal?: boolean
          created_at?: string
          deposit_value?: number | null
          end_date?: string | null
          id?: string
          monthly_value?: number
          notes?: string | null
          owner_id?: string | null
          pdf_main_document_id?: string | null
          renewal_alert_sent_at?: string | null
          room_id?: string
          signed_at?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          entry_date: string
          expected_return_date: string | null
          id: string
          justification: string | null
          multiplier: number | null
          returned_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          entry_date?: string
          expected_return_date?: string | null
          id?: string
          justification?: string | null
          multiplier?: number | null
          returned_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          entry_date?: string
          expected_return_date?: string | null
          id?: string
          justification?: string | null
          multiplier?: number | null
          returned_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_entries: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          installment_number: number | null
          installments_total: number | null
          notes: string | null
          origin: Database["public"]["Enums"]["financial_entry_origin"]
          owner_id: string | null
          paid_at: string | null
          party_contract_id: string | null
          payment_method: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["financial_entry_status"]
          type: Database["public"]["Enums"]["financial_entry_type"]
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          origin: Database["public"]["Enums"]["financial_entry_origin"]
          owner_id?: string | null
          paid_at?: string | null
          party_contract_id?: string | null
          payment_method?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"]
          type: Database["public"]["Enums"]["financial_entry_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          notes?: string | null
          origin?: Database["public"]["Enums"]["financial_entry_origin"]
          owner_id?: string | null
          paid_at?: string | null
          party_contract_id?: string | null
          payment_method?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["financial_entry_status"]
          type?: Database["public"]["Enums"]["financial_entry_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_party_contract_id_fkey"
            columns: ["party_contract_id"]
            isOneToOne: false
            referencedRelation: "party_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      house_manual_sections: {
        Row: {
          apartment_id: string | null
          body: string
          category: string
          created_at: string
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          apartment_id?: string | null
          body?: string
          category: string
          created_at?: string
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          apartment_id?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_manual_sections_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          apartment_id: string | null
          checklist: Json | null
          contract_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["inspection_kind"]
          notes: string | null
          performed_at: string | null
          performed_by: string | null
          room_id: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["inspection_status"]
          updated_at: string
        }
        Insert: {
          apartment_id?: string | null
          checklist?: Json | null
          contract_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["inspection_kind"]
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          room_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["inspection_status"]
          updated_at?: string
        }
        Update: {
          apartment_id?: string | null
          checklist?: Json | null
          contract_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["inspection_kind"]
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          room_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["inspection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          language: string | null
          notes: string | null
          origin: string | null
          owner_id: string | null
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          language?: string | null
          notes?: string | null
          origin?: string | null
          owner_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          language?: string | null
          notes?: string | null
          origin?: string | null
          owner_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      owner_documents: {
        Row: {
          apartment_id: string | null
          category: string
          created_at: string
          file_path: string
          id: string
          mime_type: string | null
          owner_id: string
          size_bytes: number | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          apartment_id?: string | null
          category?: string
          created_at?: string
          file_path: string
          id?: string
          mime_type?: string | null
          owner_id: string
          size_bytes?: number | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          apartment_id?: string | null
          category?: string
          created_at?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          owner_id?: string
          size_bytes?: number | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_documents_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_messages: {
        Row: {
          body: string
          created_at: string
          from_staff: boolean
          id: string
          owner_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          from_staff?: boolean
          id?: string
          owner_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          from_staff?: boolean
          id?: string
          owner_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_messages_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_payout_items: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          kind: string
          payment_id: string | null
          payout_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          payment_id?: string | null
          payout_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          payment_id?: string | null
          payout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_payout_items_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "owner_payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_payouts: {
        Row: {
          costs: number
          created_at: string
          final_amount: number
          gross_revenue: number
          id: string
          model: string
          notes: string | null
          owner_id: string
          paid_at: string | null
          percentage: number | null
          period_end: string
          period_start: string
          proof_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          costs?: number
          created_at?: string
          final_amount?: number
          gross_revenue?: number
          id?: string
          model: string
          notes?: string | null
          owner_id: string
          paid_at?: string | null
          percentage?: number | null
          period_end: string
          period_start: string
          proof_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          costs?: number
          created_at?: string
          final_amount?: number
          gross_revenue?: number
          id?: string
          model?: string
          notes?: string | null
          owner_id?: string
          paid_at?: string | null
          percentage?: number | null
          period_end?: string
          period_start?: string
          proof_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      owners: {
        Row: {
          bank_info: Json | null
          created_at: string
          document: string | null
          financial_notes: string | null
          id: string
          notes: string | null
          profile_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bank_info?: Json | null
          created_at?: string
          document?: string | null
          financial_notes?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bank_info?: Json | null
          created_at?: string
          document?: string | null
          financial_notes?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owners_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      party_contract_send_history: {
        Row: {
          error_message: string | null
          id: string
          party_contract_id: string
          recipient_email: string
          sent_at: string
          sent_by: string | null
          status: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          party_contract_id: string
          recipient_email: string
          sent_at?: string
          sent_by?: string | null
          status?: string
        }
        Update: {
          error_message?: string | null
          id?: string
          party_contract_id?: string
          recipient_email?: string
          sent_at?: string
          sent_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_contract_send_history_party_contract_id_fkey"
            columns: ["party_contract_id"]
            isOneToOne: false
            referencedRelation: "party_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      party_contracts: {
        Row: {
          apartment_id: string | null
          content_rendered: string
          created_at: string
          created_by: string | null
          end_date: string | null
          first_due_date: string | null
          id: string
          installments_count: number
          notes: string | null
          owner_id: string | null
          party_type: Database["public"]["Enums"]["party_contract_type"]
          pdf_path: string | null
          profile_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["party_contract_status"]
          template_id: string | null
          title: string
          total_value: number
          updated_at: string
        }
        Insert: {
          apartment_id?: string | null
          content_rendered?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          first_due_date?: string | null
          id?: string
          installments_count?: number
          notes?: string | null
          owner_id?: string | null
          party_type: Database["public"]["Enums"]["party_contract_type"]
          pdf_path?: string | null
          profile_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["party_contract_status"]
          template_id?: string | null
          title: string
          total_value?: number
          updated_at?: string
        }
        Update: {
          apartment_id?: string | null
          content_rendered?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          first_due_date?: string | null
          id?: string
          installments_count?: number
          notes?: string | null
          owner_id?: string | null
          party_type?: Database["public"]["Enums"]["party_contract_type"]
          pdf_path?: string | null
          profile_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["party_contract_status"]
          template_id?: string | null
          title?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_contracts_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_contracts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_contracts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_batches: {
        Row: {
          actor_id: string | null
          affected_count: number
          created_at: string
          details: Json
          id: string
          operation_type: string
        }
        Insert: {
          actor_id?: string | null
          affected_count?: number
          created_at?: string
          details?: Json
          id?: string
          operation_type: string
        }
        Update: {
          actor_id?: string | null
          affected_count?: number
          created_at?: string
          details?: Json
          id?: string
          operation_type?: string
        }
        Relationships: []
      }
      payment_charges: {
        Row: {
          amount: number
          applied_at: string
          id: string
          kind: string
          payment_id: string
          reason: string | null
        }
        Insert: {
          amount: number
          applied_at?: string
          id?: string
          kind: string
          payment_id: string
          reason?: string | null
        }
        Update: {
          amount?: number
          applied_at?: string
          id?: string
          kind?: string
          payment_id?: string
          reason?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          batch_id: string | null
          contract_id: string
          created_at: string
          description: string | null
          due_date: string
          expires_at: string | null
          id: string
          interest: number
          kind: Database["public"]["Enums"]["payment_kind"]
          late_fee: number
          method: string | null
          notes: string | null
          original_amount: number | null
          paid_at: string | null
          person_id: string | null
          proof_rejection_reason: string | null
          proof_url: string | null
          proof_validated_at: string | null
          proof_validated_by: string | null
          proof_validation_status: string | null
          receipt_number: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          batch_id?: string | null
          contract_id: string
          created_at?: string
          description?: string | null
          due_date: string
          expires_at?: string | null
          id?: string
          interest?: number
          kind?: Database["public"]["Enums"]["payment_kind"]
          late_fee?: number
          method?: string | null
          notes?: string | null
          original_amount?: number | null
          paid_at?: string | null
          person_id?: string | null
          proof_rejection_reason?: string | null
          proof_url?: string | null
          proof_validated_at?: string | null
          proof_validated_by?: string | null
          proof_validation_status?: string | null
          receipt_number?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          batch_id?: string | null
          contract_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          expires_at?: string | null
          id?: string
          interest?: number
          kind?: Database["public"]["Enums"]["payment_kind"]
          late_fee?: number
          method?: string | null
          notes?: string | null
          original_amount?: number | null
          paid_at?: string | null
          person_id?: string | null
          proof_rejection_reason?: string | null
          proof_url?: string | null
          proof_validated_at?: string | null
          proof_validated_by?: string | null
          proof_validation_status?: string | null
          receipt_number?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      person_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          profile_id: string
          scope: string
          size_bytes: number | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          profile_id: string
          scope: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          profile_id?: string
          scope?: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          id: string
          internal_notes: string | null
          last_name: string | null
          marital_status: string | null
          nationality: string | null
          neighborhood: string | null
          number: string | null
          occupation: string | null
          passport: string | null
          phone: string | null
          rg: string | null
          state: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id: string
          internal_notes?: string | null
          last_name?: string | null
          marital_status?: string | null
          nationality?: string | null
          neighborhood?: string | null
          number?: string | null
          occupation?: string | null
          passport?: string | null
          phone?: string | null
          rg?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          last_name?: string | null
          marital_status?: string | null
          nationality?: string | null
          neighborhood?: string | null
          number?: string | null
          occupation?: string | null
          passport?: string | null
          phone?: string | null
          rg?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          apartment_id: string
          available_from: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          photos: string[] | null
          price_monthly: number
          size_m2: number | null
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          apartment_id: string
          available_from?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photos?: string[] | null
          price_monthly: number
          size_m2?: number | null
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          apartment_id?: string
          available_from?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photos?: string[] | null
          price_monthly?: number
          size_m2?: number | null
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_requests: {
        Row: {
          contract_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["stay_request_kind"]
          payload: Json
          profile_id: string
          status: Database["public"]["Enums"]["stay_request_status"]
          updated_at: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["stay_request_kind"]
          payload?: Json
          profile_id: string
          status?: Database["public"]["Enums"]["stay_request_status"]
          updated_at?: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["stay_request_kind"]
          payload?: Json
          profile_id?: string
          status?: Database["public"]["Enums"]["stay_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          apartment_id: string | null
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          cost: number | null
          created_at: string
          description: string | null
          id: string
          owner_approval: string | null
          photos: string[] | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          reporter_id: string
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string
        }
        Insert: {
          apartment_id?: string | null
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          owner_approval?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          reporter_id: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string
        }
        Update: {
          apartment_id?: string | null
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          owner_approval?: string | null
          photos?: string[] | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          reporter_id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["timeline_entity"]
          event_type: string
          id: string
          metadata: Json | null
          occurred_at: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["timeline_entity"]
          event_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["timeline_entity"]
          event_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          active: boolean
          category: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_overdue_charges: {
        Args: never
        Returns: {
          juros_applied: number
          multa_applied: number
          updated_payment_id: string
        }[]
      }
      expire_overdue_reservations: { Args: never; Returns: number }
      generate_contract_financial_entries: {
        Args: { _contract_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_timeline: {
        Args: {
          _description?: string
          _entity_id: string
          _entity_type: Database["public"]["Enums"]["timeline_entity"]
          _event_type: string
          _metadata?: Json
          _title: string
        }
        Returns: undefined
      }
      mark_overdue_financial_entries: { Args: never; Returns: number }
      user_has_apartment_access: {
        Args: { _apt: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      apartment_status:
        | "disponivel"
        | "alugada"
        | "aguardando_vistoria"
        | "desativado"
      app_role:
        | "admin"
        | "operacao"
        | "moradora"
        | "proprietario"
        | "fornecedor"
        | "financeiro"
        | "comercial"
      application_status:
        | "nova"
        | "em_analise"
        | "entrevista"
        | "aprovada"
        | "recusada"
        | "cancelada"
      contract_addendum_kind:
        | "prorrogacao"
        | "reajuste"
        | "troca_quarto"
        | "outro"
      contract_addendum_status: "rascunho" | "ativo" | "cancelado"
      contract_document_status:
        | "rascunho"
        | "pendente_aprovacao"
        | "aprovado"
        | "enviado"
        | "assinado"
        | "vencido"
        | "cancelado"
        | "renovado"
      contract_status: "rascunho" | "ativo" | "encerrado" | "cancelado"
      contract_template_kind:
        | "moradora"
        | "proprietario"
        | "regras_casa"
        | "vistoria"
        | "aditivo"
      financial_entry_origin:
        | "contrato_morador"
        | "contrato_proprietario"
        | "receita_avulsa"
        | "despesa_avulsa"
      financial_entry_status: "pendente" | "pago" | "vencido" | "cancelado"
      financial_entry_type: "pagar" | "receber"
      house_gender: "feminina" | "mista" | "sem_preferencia"
      inspection_kind: "entrada" | "periodica" | "saida"
      inspection_status: "agendada" | "realizada" | "pendencias"
      lead_status: "novo" | "qualificado" | "descartado" | "convertido"
      party_contract_status:
        | "rascunho"
        | "enviado"
        | "assinado"
        | "ativo"
        | "finalizado"
        | "cancelado"
      party_contract_type: "morador" | "proprietario"
      payment_kind:
        | "caucao"
        | "mensalidade"
        | "taxa"
        | "multa"
        | "outro"
        | "reserva"
        | "proporcional"
        | "repasse"
      payment_status:
        | "pendente"
        | "pago"
        | "atrasado"
        | "cancelado"
        | "estornado"
        | "expirado"
      room_status:
        | "disponivel"
        | "reservado"
        | "ocupado"
        | "manutencao"
        | "alugada"
        | "aguardando_vistoria"
        | "desativado"
      stay_request_kind: "renovacao" | "saida"
      stay_request_status:
        | "aberto"
        | "em_analise"
        | "aprovado"
        | "recusado"
        | "concluido"
      ticket_category:
        | "manutencao"
        | "limpeza"
        | "eletrica"
        | "hidraulica"
        | "internet"
        | "mobilia"
        | "outro"
      ticket_priority: "baixa" | "media" | "alta" | "urgente"
      ticket_status:
        | "aberto"
        | "em_andamento"
        | "aguardando"
        | "resolvido"
        | "fechado"
      timeline_entity:
        | "pessoa"
        | "quarto"
        | "apartamento"
        | "contrato"
        | "candidatura"
        | "documento"
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
    Enums: {
      apartment_status: [
        "disponivel",
        "alugada",
        "aguardando_vistoria",
        "desativado",
      ],
      app_role: [
        "admin",
        "operacao",
        "moradora",
        "proprietario",
        "fornecedor",
        "financeiro",
        "comercial",
      ],
      application_status: [
        "nova",
        "em_analise",
        "entrevista",
        "aprovada",
        "recusada",
        "cancelada",
      ],
      contract_addendum_kind: [
        "prorrogacao",
        "reajuste",
        "troca_quarto",
        "outro",
      ],
      contract_addendum_status: ["rascunho", "ativo", "cancelado"],
      contract_document_status: [
        "rascunho",
        "pendente_aprovacao",
        "aprovado",
        "enviado",
        "assinado",
        "vencido",
        "cancelado",
        "renovado",
      ],
      contract_status: ["rascunho", "ativo", "encerrado", "cancelado"],
      contract_template_kind: [
        "moradora",
        "proprietario",
        "regras_casa",
        "vistoria",
        "aditivo",
      ],
      financial_entry_origin: [
        "contrato_morador",
        "contrato_proprietario",
        "receita_avulsa",
        "despesa_avulsa",
      ],
      financial_entry_status: ["pendente", "pago", "vencido", "cancelado"],
      financial_entry_type: ["pagar", "receber"],
      house_gender: ["feminina", "mista", "sem_preferencia"],
      inspection_kind: ["entrada", "periodica", "saida"],
      inspection_status: ["agendada", "realizada", "pendencias"],
      lead_status: ["novo", "qualificado", "descartado", "convertido"],
      party_contract_status: [
        "rascunho",
        "enviado",
        "assinado",
        "ativo",
        "finalizado",
        "cancelado",
      ],
      party_contract_type: ["morador", "proprietario"],
      payment_kind: [
        "caucao",
        "mensalidade",
        "taxa",
        "multa",
        "outro",
        "reserva",
        "proporcional",
        "repasse",
      ],
      payment_status: [
        "pendente",
        "pago",
        "atrasado",
        "cancelado",
        "estornado",
        "expirado",
      ],
      room_status: [
        "disponivel",
        "reservado",
        "ocupado",
        "manutencao",
        "alugada",
        "aguardando_vistoria",
        "desativado",
      ],
      stay_request_kind: ["renovacao", "saida"],
      stay_request_status: [
        "aberto",
        "em_analise",
        "aprovado",
        "recusado",
        "concluido",
      ],
      ticket_category: [
        "manutencao",
        "limpeza",
        "eletrica",
        "hidraulica",
        "internet",
        "mobilia",
        "outro",
      ],
      ticket_priority: ["baixa", "media", "alta", "urgente"],
      ticket_status: [
        "aberto",
        "em_andamento",
        "aguardando",
        "resolvido",
        "fechado",
      ],
      timeline_entity: [
        "pessoa",
        "quarto",
        "apartamento",
        "contrato",
        "candidatura",
        "documento",
      ],
    },
  },
} as const
