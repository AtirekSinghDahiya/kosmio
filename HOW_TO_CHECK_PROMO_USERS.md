# How to Check Promotional Users

## Quick Database Queries

### See All Users Who Got Promotional Tokens:

```sql
SELECT
  pr.user_email,
  pr.tokens_awarded,
  pr.redeemed_at,
  pr.ip_address
FROM promotional_redemptions pr
JOIN promotional_campaigns pc ON pr.campaign_id = pc.id
WHERE pc.campaign_code = 'FIRST100'
ORDER BY pr.redeemed_at DESC;
```

### Count How Many Spots Are Filled:

```sql
SELECT
  current_redemptions as filled_spots,
  max_redemptions as total_spots,
  (max_redemptions - current_redemptions) as remaining_spots
FROM promotional_campaigns
WHERE campaign_code = 'FIRST100';
```

### Get Campaign Status:

```sql
SELECT * FROM get_campaign_status('FIRST100');
```

This returns:
- Is campaign valid?
- Remaining slots
- Is expired?
- Token amount
- Status message

### Export All Promotional Users to CSV:

```sql
COPY (
  SELECT
    pr.user_email as "Email",
    pr.tokens_awarded as "Tokens Awarded",
    pr.redeemed_at as "Redeemed Date",
    pr.ip_address as "IP Address"
  FROM promotional_redemptions pr
  JOIN promotional_campaigns pc ON pr.campaign_id = pc.id
  WHERE pc.campaign_code = 'FIRST100'
  ORDER BY pr.redeemed_at ASC
) TO '/path/to/export.csv' WITH CSV HEADER;
```

---

## Using Supabase Dashboard

### Method 1: SQL Editor
1. Go to Supabase Dashboard
2. Click "SQL Editor" in sidebar
3. Paste any query above
4. Click "Run"
5. View results

### Method 2: Table View
1. Go to Supabase Dashboard
2. Click "Table Editor" in sidebar
3. Select `promotional_redemptions` table
4. See all redemptions with filters
5. Click "Export" to download CSV

---

## Admin Dashboard View

1. Login to your app as admin
2. Go to Admin Dashboard
3. Look for "FIRST100 Campaign" section

You'll see:
- Progress bar showing redemptions
- Recent redemptions list with emails
- Total slots filled
- Remaining spots

---

## Common Questions

### Q: How do I know if a specific user got promotional tokens?

```sql
SELECT * FROM promotional_redemptions
WHERE user_email = 'user@example.com';
```

### Q: How many tokens have been distributed in total?

```sql
SELECT SUM(tokens_awarded) as total_tokens_distributed
FROM promotional_redemptions pr
JOIN promotional_campaigns pc ON pr.campaign_id = pc.id
WHERE pc.campaign_code = 'FIRST100';
```

### Q: When did the first/last person redeem?

```sql
-- First redemption
SELECT user_email, redeemed_at
FROM promotional_redemptions
ORDER BY redeemed_at ASC
LIMIT 1;

-- Last redemption
SELECT user_email, redeemed_at
FROM promotional_redemptions
ORDER BY redeemed_at DESC
LIMIT 1;
```

### Q: How many redemptions per day?

```sql
SELECT
  DATE(redeemed_at) as date,
  COUNT(*) as redemptions
FROM promotional_redemptions pr
JOIN promotional_campaigns pc ON pr.campaign_id = pc.id
WHERE pc.campaign_code = 'FIRST100'
GROUP BY DATE(redeemed_at)
ORDER BY date DESC;
```

---

## Verifying User Got Tokens

Check a user's profile:

```sql
SELECT
  id,
  email,
  tokens_balance,
  free_tokens_balance,
  paid_tokens_balance,
  created_at
FROM profiles
WHERE email = 'user@example.com';
```

Expected for promotional user:
- `tokens_balance`: ~5,150,000 (150k free + 5M promo)
- `free_tokens_balance`: 150,000
- `paid_tokens_balance`: 5,000,000

---

## Real-Time Monitoring

### Set up a view for easy checking:

```sql
CREATE VIEW promotional_users_summary AS
SELECT
  pr.user_email,
  pr.tokens_awarded,
  pr.redeemed_at,
  p.tokens_balance as current_balance,
  p.paid_tokens_balance as promo_balance
FROM promotional_redemptions pr
JOIN promotional_campaigns pc ON pr.campaign_id = pc.id
JOIN profiles p ON pr.user_id = p.id
WHERE pc.campaign_code = 'FIRST100'
ORDER BY pr.redeemed_at DESC;
```

Then simply query:
```sql
SELECT * FROM promotional_users_summary;
```

---

## Fraud Detection

### Check for duplicate IPs:

```sql
SELECT
  ip_address,
  COUNT(*) as redemptions,
  ARRAY_AGG(user_email) as emails
FROM promotional_redemptions
WHERE campaign_id = (
  SELECT id FROM promotional_campaigns WHERE campaign_code = 'FIRST100'
)
GROUP BY ip_address
HAVING COUNT(*) > 1;
```

### Check for similar emails:

```sql
SELECT user_email, user_id, redeemed_at
FROM promotional_redemptions
WHERE user_email LIKE '%+%'  -- Look for email aliases
ORDER BY redeemed_at;
```

---

## Campaign Management

### Deactivate campaign early:

```sql
UPDATE promotional_campaigns
SET is_active = false
WHERE campaign_code = 'FIRST100';
```

### Extend campaign:

```sql
UPDATE promotional_campaigns
SET max_redemptions = 150  -- Increase from 100 to 150
WHERE campaign_code = 'FIRST100';
```

### Set expiration date:

```sql
UPDATE promotional_campaigns
SET expires_at = '2025-12-31 23:59:59'
WHERE campaign_code = 'FIRST100';
```

---

## Quick Stats Dashboard Query

```sql
SELECT
  'FIRST100 Campaign' as campaign,
  current_redemptions || '/' || max_redemptions as "Slots Filled",
  ROUND((current_redemptions::numeric / max_redemptions * 100), 1) || '%' as "Progress",
  (max_redemptions - current_redemptions) as "Remaining",
  (current_redemptions * token_amount) as "Total Tokens Distributed",
  CASE
    WHEN is_active AND (expires_at IS NULL OR expires_at > NOW())
      AND current_redemptions < max_redemptions
    THEN '✅ Active'
    WHEN current_redemptions >= max_redemptions THEN '🔴 Full'
    WHEN NOT is_active THEN '⏸️ Paused'
    WHEN expires_at < NOW() THEN '⏱️ Expired'
  END as "Status"
FROM promotional_campaigns
WHERE campaign_code = 'FIRST100';
```

---

## Troubleshooting

### User says they didn't get tokens:

1. Check if redemption exists:
```sql
SELECT * FROM promotional_redemptions
WHERE user_email = 'user@example.com';
```

2. Check their profile:
```sql
SELECT tokens_balance, paid_tokens_balance
FROM profiles
WHERE email = 'user@example.com';
```

3. If redemption exists but balance is wrong, manually add tokens:
```sql
UPDATE profiles
SET paid_tokens_balance = paid_tokens_balance + 5000000
WHERE email = 'user@example.com';
```

---

## Need Help?

All promotional data is in two tables:
- `promotional_campaigns` - Campaign settings
- `promotional_redemptions` - Who redeemed what

Use the queries above to monitor and manage the campaign!
