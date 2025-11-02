# Promotional Campaign System - User Guide

## Overview

The promotional campaign system has been successfully implemented to reward the first 100 users with 5 million bonus tokens when they sign up through a special promotional link.

## Features Implemented

### 1. Database Schema
- **promotional_campaigns table**: Stores campaign details (code, token amount, max redemptions, current redemptions, etc.)
- **promotional_redemptions table**: Tracks which users have redeemed which campaigns
- Atomic redemption function prevents race conditions and ensures exactly 100 redemptions

### 2. Promotional Landing Page
- **URL**: Access via `#promo` or `#first100` in the landing page
- Real-time campaign status display
- Shows remaining slots out of 100
- Progress bar visualization
- Benefits breakdown showing what users can do with 5M tokens
- FAQ section

### 3. Signup Flow Integration
- **Promo URL**: `/login?promo=FIRST100`
- Automatic promo detection from URL parameter
- Displays promotional banner during signup with live remaining slots counter
- Promo code stored in sessionStorage (expires after 1 hour)
- Automatic redemption after successful signup

### 4. Success & Expiration Modals
- **Success Modal**: Celebration popup with confetti animation, shows tokens awarded
- **Expired Modal**: Friendly message when all 100 spots are claimed, auto-redirects to normal signup after 5 seconds

### 5. Admin Dashboard Integration
- Campaign overview card showing:
  - Total slots (100)
  - Claimed slots
  - Remaining slots
  - Campaign progress bar
  - Recent redemptions with user details
  - Total value distributed

## How to Use

### For Marketing:

1. **Share the Promotional Link**:
   - Direct signup link: `https://yourdomain.com/login?promo=FIRST100`
   - Landing page: `https://yourdomain.com/#promo` or `https://yourdomain.com/#first100`

2. **Campaign Details**:
   - Code: `FIRST100`
   - Token Amount: 5,000,000 tokens per user
   - Max Redemptions: 100 users
   - Additional to free tokens (not replacement)

### For Users:

1. Click the promotional link
2. Complete signup with email and password
3. Automatically receive 5M bonus tokens
4. See celebration modal confirming token award
5. Start using AI features immediately

### For Admins:

1. Navigate to Admin Dashboard (enterprise plan required)
2. View promotional campaign section at the top
3. Monitor:
   - Real-time redemption count
   - Recent redemptions with timestamps
   - Campaign progress
   - Total value distributed

## Technical Details

### Database Functions

**`get_campaign_status(campaign_code)`**
- Returns campaign validity, remaining slots, expiration status, token amount, and message
- Used for checking if campaign is still active

**`redeem_promo_atomic(user_id, campaign_code, ip_address, user_agent)`**
- Atomically redeems promo code with row-level locking
- Prevents double redemptions and race conditions
- Adds tokens to user's `paid_tokens_balance`
- Returns success status, tokens awarded, and redemption ID

### Security Features

- One redemption per Firebase user ID (database constraint)
- Atomic database operations prevent race conditions
- IP address and user agent logging for fraud detection
- Campaign can be manually deactivated by admin
- RLS disabled (using Firebase auth instead)

### Frontend Components

**PromoService (`src/lib/promoService.ts`)**
- `checkCampaignStatus()`: Validates promo code
- `redeemPromoCode()`: Redeems promo for user
- `storePromoCodeInSession()`: Stores code for signup flow
- `getPromoCodeFromSession()`: Retrieves stored code
- Session storage expires after 1 hour

**Components**
- `PromoBanner`: Displays promo info during signup
- `PromoSuccessModal`: Celebration modal with confetti
- `OfferExpiredModal`: Shown when campaign is full
- `PromoLandingPage`: Dedicated promotional page

## Campaign Status

The FIRST100 campaign is:
- **Active**: ✅
- **Token Amount**: 5,000,000
- **Max Redemptions**: 100
- **Current Redemptions**: 0
- **Remaining**: 100

## URLs for Marketing

1. **Direct Signup**: `/login?promo=FIRST100`
2. **Landing Page**: `/#promo` or `/#first100`
3. **Share Message**: "Join KroniQ and get 5 million FREE tokens! Be one of the first 100 users: [link]"

## Error Handling

- Campaign full → Shows expired modal, redirects to normal signup
- User already redeemed → Silent skip, continues signup
- Invalid promo code → Removes from session, continues normal signup
- Network error → Logs error, user keeps free tokens
- Redemption failure → Shows error toast, doesn't block signup

## Monitoring

Check campaign progress:
1. Admin Dashboard → Promotions section
2. View recent redemptions with user emails
3. Track remaining slots in real-time
4. Export redemption data if needed

## Notes

- Tokens are **additional** to the normal free tokens users receive
- Promotional tokens are added to `paid_tokens_balance` (never expire)
- Campaign automatically becomes invalid when 100 redemptions reached
- Users can still sign up normally after campaign ends
- The system supports multiple campaigns (add new campaigns to database)

## Future Enhancements

Possible improvements:
- Multiple campaign support in UI
- Export redemption data as CSV
- Email notifications at milestones (50%, 75%, 100%)
- UTM parameter tracking for conversion metrics
- A/B testing different token amounts
- Referral system for users to invite friends

---

**System Status**: ✅ Fully Operational
**Last Updated**: 2025-11-02
