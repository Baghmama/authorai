# Manual Credit Management Guide

This guide provides step-by-step instructions for manually updating user credits in Supabase.

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Navigate to the "SQL Editor" tab

### Step 2: Find User Information
First, find the user you want to update credits for:

```sql
-- Find user by email
SELECT 
  u.id as user_id,
  u.email,
  uc.credits,
  uc.updated_at
FROM auth.users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email = 'user@example.com';
```

### Step 3: Add Credits to User
Use the built-in function to safely add credits:

```sql
-- Add 50 credits to a user
SELECT add_credits(
  'USER_ID_HERE'::uuid,
  50,
  'Manual credit top-up - Customer support'
);
```

### Step 4: Verify Credit Update
Check that the credits were updated correctly:

```sql
-- Verify the update
SELECT 
  credits,
  updated_at
FROM user_credits
WHERE user_id = 'USER_ID_HERE'::uuid;
```

## Method 2: Direct Database Updates (Advanced)

### Adding Credits Manually
```sql
-- Direct update (use with caution)
UPDATE user_credits 
SET credits = credits + 50,
    updated_at = now()
WHERE user_id = 'USER_ID_HERE'::uuid;

-- Record the transaction manually
INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
VALUES (
  'USER_ID_HERE'::uuid,
  50,
  'manual_adjustment',
  'Manual credit adjustment - Support ticket #123'
);
```

### Setting Specific Credit Amount
```sql
-- Set credits to a specific amount
UPDATE user_credits 
SET credits = 100,
    updated_at = now()
WHERE user_id = 'USER_ID_HERE'::uuid;

-- Record the transaction
INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
VALUES (
  'USER_ID_HERE'::uuid,
  100,
  'manual_adjustment',
  'Credit balance reset to 100'
);
```

## Method 3: Bulk Credit Operations

### Add Credits to Multiple Users
```sql
-- Add 30 credits to all users with less than 10 credits
UPDATE user_credits 
SET credits = credits + 30,
    updated_at = now()
WHERE credits < 10;

-- Record bulk transactions
INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
SELECT 
  user_id,
  30,
  'bulk_adjustment',
  'Bulk credit top-up for low balance users'
FROM user_credits
WHERE credits < 40 AND credits >= 30; -- Users who just received credits
```

### Reset All User Credits
```sql
-- Reset all users to 30 credits (use with extreme caution)
UPDATE user_credits 
SET credits = 30,
    updated_at = now();

-- Record bulk reset
INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
SELECT 
  user_id,
  30,
  'bulk_reset',
  'Monthly credit reset'
FROM user_credits;
```

## Useful Queries for Credit Management

### View All Users and Their Credits
```sql
SELECT 
  u.email,
  u.created_at as user_created,
  uc.credits,
  uc.updated_at as credits_updated,
  (
    SELECT COUNT(*)
    FROM credit_transactions ct
    WHERE ct.user_id = u.id AND ct.transaction_type = 'chapter_generation'
  ) as chapters_generated
FROM auth.users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
ORDER BY uc.credits ASC;
```

### View Users with Low Credits
```sql
SELECT 
  u.email,
  uc.credits,
  uc.updated_at
FROM auth.users u
JOIN user_credits uc ON u.id = uc.user_id
WHERE uc.credits < 12  -- Less than 2 chapter generations
ORDER BY uc.credits ASC;
```

### View Credit Transaction History for a User
```sql
SELECT 
  ct.amount,
  ct.transaction_type,
  ct.description,
  ct.created_at,
  uc.credits as current_credits
FROM credit_transactions ct
JOIN user_credits uc ON ct.user_id = uc.user_id
JOIN auth.users u ON ct.user_id = u.id
WHERE u.email = 'user@example.com'
ORDER BY ct.created_at DESC;
```

### Calculate Total Credits Used
```sql
SELECT 
  u.email,
  COALESCE(SUM(CASE WHEN ct.amount < 0 THEN ABS(ct.amount) ELSE 0 END), 0) as total_credits_used,
  COALESCE(SUM(CASE WHEN ct.amount > 0 THEN ct.amount ELSE 0 END), 0) as total_credits_added,
  uc.credits as current_credits
FROM auth.users u
LEFT JOIN credit_transactions ct ON u.id = ct.user_id
LEFT JOIN user_credits uc ON u.id = uc.user_id
GROUP BY u.id, u.email, uc.credits
ORDER BY total_credits_used DESC;
```

## Best Practices

### 1. Always Use Transactions
When making manual adjustments, always record them in the `credit_transactions` table for audit purposes.

### 2. Use Descriptive Messages
Include clear descriptions in credit transactions to track why adjustments were made.

### 3. Verify Before and After
Always check the user's credit balance before and after making changes.

### 4. Use the Built-in Functions
Prefer using the `add_credits()` function over direct updates as it handles transactions automatically.

### 5. Monitor Credit Usage
Regularly review credit usage patterns to identify potential issues or abuse.

## Emergency Procedures

### Refund Credits for Failed Operations
If a user's credits were deducted but the operation failed:

```sql
-- Refund credits for failed chapter generation
SELECT add_credits(
  'USER_ID_HERE'::uuid,
  6,  -- Amount to refund (6 credits per chapter)
  'Refund for failed chapter generation - Support ticket #123'
);
```

### Investigate Suspicious Activity
```sql
-- Find users with unusual credit usage patterns
SELECT 
  u.email,
  COUNT(ct.id) as transaction_count,
  SUM(CASE WHEN ct.amount < 0 THEN ABS(ct.amount) ELSE 0 END) as total_spent,
  MAX(ct.created_at) as last_activity
FROM auth.users u
JOIN credit_transactions ct ON u.id = ct.user_id
WHERE ct.created_at > now() - interval '24 hours'
GROUP BY u.id, u.email
HAVING COUNT(ct.id) > 10  -- More than 10 transactions in 24 hours
ORDER BY transaction_count DESC;
```