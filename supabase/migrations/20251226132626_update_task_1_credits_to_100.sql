/*
  # Update Task 1 Credits to 100

  ## Changes
  - Updates the twitter_share task credit reward from 200 to 100
  - Total free credits available: 450 (Task 1: 100 + Task 2: 200 + Task 3: 150)
*/

UPDATE credit_task_settings
SET credits_reward = 100
WHERE task_type = 'twitter_share';