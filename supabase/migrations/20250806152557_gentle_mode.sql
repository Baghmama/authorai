/*
  # Add user signup trigger for credit initialization

  1. Database Functions
    - `initialize_user_credits()` - Function to create initial credit entry for new users
  
  2. Triggers
    - Trigger on `auth.users` table to automatically initialize credits on signup
  
  3. Security
    - Function runs with security definer privileges to bypass RLS during initialization
*/

-- Create function to initialize user credits
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert initial credits for the new user
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 30);
  
  -- Record the initial credit allocation in transactions
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 30, 'initial_allocation', 'Initial credit allocation for new user');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error initializing credits for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.user_credits TO supabase_auth_admin;
GRANT ALL ON public.credit_transactions TO supabase_auth_admin;