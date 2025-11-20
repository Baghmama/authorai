import { supabase } from '../lib/supabase';

export interface CreditResult {
  success: boolean;
  credits: number;
  error?: string;
  deducted?: number;
}

export interface UserCredits {
  user_id: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

/**
 * Get current user's credit balance
 */
export async function getUserCredits(): Promise<UserCredits | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No credit entry exists, create one for the new user
        const { data: newUserCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: user.id,
            credits: 30
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user credits:', insertError);
          return null;
        }

        // Record the initial credit allocation in transactions
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            amount: 30,
            transaction_type: 'initial_allocation',
            description: 'Initial credit allocation for new user'
          });

        return newUserCredits;
      } else {
        console.error('Error fetching user credits:', error);
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error('Error in getUserCredits:', error);
    return null;
  }
}

/**
 * Deduct credits for chapter generation
 */
export async function deductCreditsForChapterGeneration(chapters: number): Promise<CreditResult> {
  const creditsPerChapter = 6;
  const totalCreditsNeeded = chapters * creditsPerChapter;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        credits: 0,
        error: 'User not authenticated'
      };
    }

    // Call the database function to deduct credits
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: totalCreditsNeeded,
      p_transaction_type: 'chapter_generation',
      p_description: `Generated ${chapters} chapter outlines`
    });

    if (error) {
      console.error('Error deducting credits:', error);
      return {
        success: false,
        credits: 0,
        error: 'Failed to deduct credits'
      };
    }

    return data as CreditResult;
  } catch (error) {
    console.error('Error in deductCreditsForChapterGeneration:', error);
    return {
      success: false,
      credits: 0,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get user's credit transaction history
 */
export async function getCreditTransactions(): Promise<CreditTransaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credit transactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCreditTransactions:', error);
    return [];
  }
}

/**
 * Check if user has enough credits for an operation
 */
export async function hasEnoughCredits(requiredCredits: number): Promise<boolean> {
  const userCredits = await getUserCredits();
  return userCredits ? userCredits.credits >= requiredCredits : false;
}

/**
 * Calculate credits needed for chapter generation
 */
export function calculateCreditsNeeded(chapters: number): number {
  const creditsPerChapter = 6;
  return chapters * creditsPerChapter;
}

/**
 * Check if user has enough credits and deduct if available
 */
export async function checkAndDeductCredits(userId: string, amount: number): Promise<boolean> {
  try {
    // Call the database function to deduct credits
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: 'director_mode',
      p_description: `Director Mode AI generation`
    });

    if (error) {
      console.error('Error deducting credits:', error);
      return false;
    }

    const result = data as CreditResult;
    return result.success;
  } catch (error) {
    console.error('Error in checkAndDeductCredits:', error);
    return false;
  }
}