import { createClient } from '@supabase/supabase-js';
import type { SupabaseRequest, InsertSupabaseRequest } from '@shared/schema';

const SUPABASE_URL = 'https://whhlmtatsnxzovzbcnbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaGxtdGF0c254em92emJjbmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTA3OTAsImV4cCI6MjA3NjEyNjc5MH0.2BF2fOtw2_Qc8QyiApgZ_-NMVyGO8mAjDrOT9oXeYH8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseAPI {
  async createRequest(data: InsertSupabaseRequest): Promise<SupabaseRequest | null> {
    try {
      const { data: request, error } = await supabase
        .from('requests')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      return request;
    } catch (error) {
      console.error('Failed to create request:', error);
      throw error;
    }
  }

  async getAllRequests(): Promise<SupabaseRequest[]> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase select error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      throw error;
    }
  }

  async updateRequestOneSignalId(requestId: string, oneSignalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ onesignal_id: oneSignalId })
        .eq('id', requestId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update OneSignal ID:', error);
      throw error;
    }
  }
}

export const supabaseAPI = new SupabaseAPI();
