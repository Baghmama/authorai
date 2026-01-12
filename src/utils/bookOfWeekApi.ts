import { supabase } from '../lib/supabase';

export interface BookOfTheWeek {
  id: string;
  week_start_date: string;
  week_end_date: string;
  book_title: string;
  book_drive_url: string;
  google_form_url: string;
  is_active: boolean;
  past_results_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookOfWeekData {
  week_start_date: string;
  week_end_date: string;
  book_title: string;
  book_drive_url: string;
  google_form_url: string;
  is_active: boolean;
  past_results_url?: string;
}

export async function getActiveBookOfWeek(): Promise<BookOfTheWeek | null> {
  try {
    const { data, error } = await supabase
      .from('book_of_the_week')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching active book of the week:', error);
    return null;
  }
}

export async function getAllBooksOfWeek(): Promise<BookOfTheWeek[]> {
  try {
    const { data, error } = await supabase
      .from('book_of_the_week')
      .select('*')
      .order('week_start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all books of the week:', error);
    return [];
  }
}

export async function createBookOfWeek(bookData: CreateBookOfWeekData): Promise<{ success: boolean; data?: BookOfTheWeek; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('book_of_the_week')
      .insert([bookData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating book of the week:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create book of the week'
    };
  }
}

export async function updateBookOfWeek(id: string, bookData: Partial<CreateBookOfWeekData>): Promise<{ success: boolean; data?: BookOfTheWeek; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('book_of_the_week')
      .update(bookData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating book of the week:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update book of the week'
    };
  }
}

export async function deleteBookOfWeek(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('book_of_the_week')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting book of the week:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete book of the week'
    };
  }
}

export async function setActiveBook(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('book_of_the_week')
      .update({ is_active: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error setting active book:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set active book'
    };
  }
}
