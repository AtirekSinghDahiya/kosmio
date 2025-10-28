# Remaining Updates Implementation Plan

## ✅ Completed
1. Updated "Our Journey" section with actual company milestones
2. Updated Contact page with correct email (kroniq.ca@gmail.com) and location (Toronto, CA)
3. Updated stats across platform (100+ users, 2,500+ generations, 99.5% uptime, 4.4/5 rating)
4. Created ServicesPage showing all AI models and capabilities
5. Created CareersPage with 10 job positions and salaries
6. Updated AboutPage milestones to reflect actual timeline

## 🔄 In Progress / To Do

### 1. Navigation & Routing Updates
**Files to modify:**
- `src/components/Landing/LandingRouter.tsx` - Add routes for Services and Careers pages
- `src/components/Landing/LandingNavbar.tsx` - Update navigation links
- `src/components/Layout/FloatingNavbar.tsx` - Add Services link, remove Blog/API links

**Code changes needed:**
```tsx
// Add to LandingRouter.tsx
import { ServicesPage } from './ServicesPage';
import { CareersPage } from './CareersPage';

// Add routes:
{currentPage === 'services' && <ServicesPage />}
{currentPage === 'careers' && <CareersPage />}

// Update navigation context to include 'services' and 'careers' pages
```

### 2. Social Media Links Update
**Files to modify:**
- Any footer components
- Landing page social links
- About page social links

**Changes:**
- Remove: Twitter, GitHub, Discord
- Keep/Update: LinkedIn - https://www.linkedin.com/company/kroniq-ai/
- Add: YouTube - https://www.youtube.com/@KroniQ-AI

### 3. Remove OpenRouter References
**Files to search and update:**
- `src/lib/openRouterService.ts` - Keep file but don't mention it's third-party in UI
- Any documentation or UI text that mentions "OpenRouter" or "third-party"
- DocsPage, AboutPage, any help text

**Search command:**
```bash
grep -r "OpenRouter" src/
grep -r "third.party" src/
grep -r "third party" src/
```

### 4. Legal Pages to Create

#### A. Privacy Policy Page
**File:** `src/components/Legal/PrivacyPolicyPage.tsx`
**Content should include:**
- Data collection practices
- How we use cookies
- User data protection
- Third-party services (AI providers)
- Data retention and deletion
- User rights (GDPR, CCPA)
- Contact for privacy concerns

#### B. Terms of Service Page
**File:** `src/components/Legal/TermsOfServicePage.tsx`
**Content should include:**
- Acceptable use policy
- Account responsibilities
- Token/credit terms
- Intellectual property rights
- Content ownership
- Limitation of liability
- Dispute resolution
- Termination rights

#### C. Cookie Policy Page
**File:** `src/components/Legal/CookiePolicyPage.tsx`
**Content should include:**
- Types of cookies used
- Purpose of each cookie
- How to manage cookies
- Third-party cookies
- Cookie consent requirements

#### D. Security Page
**File:** `src/components/Legal/SecurityPage.tsx`
**Content should include:**
- Data encryption practices
- Security measures
- Incident response
- Secure payment processing
- API security
- User account security tips

### 5. Cookie Consent Banner
**File to create:** `src/components/Common/CookieConsent.tsx`

**Implementation:**
```tsx
import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 glass-panel rounded-2xl p-6 border border-white/20 shadow-2xl animate-slide-up">
      <div className="flex items-start gap-4">
        <Cookie className="w-6 h-6 text-[#00FFF0] flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-white font-bold mb-2">We use cookies</h3>
          <p className="text-white/70 text-sm mb-4">
            We use cookies to enhance your experience, analyze traffic, and personalize content.{' '}
            <a href="/cookie-policy" className="text-[#00FFF0] hover:underline">
              Learn more
            </a>
          </p>
          <div className="flex gap-3">
            <button
              onClick={acceptCookies}
              className="px-4 py-2 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white rounded-lg font-semibold hover:scale-105 transition-all text-sm"
            >
              Accept
            </button>
            <button
              onClick={declineCookies}
              className="px-4 py-2 glass-panel border border-white/20 text-white rounded-lg font-semibold hover:border-white/40 transition-all text-sm"
            >
              Decline
            </button>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
```

**Add to App.tsx:**
```tsx
import { CookieConsent } from './components/Common/CookieConsent';

// Add before closing div:
<CookieConsent />
```

### 6. Footer Updates
**File:** Find footer component (likely in Landing components or App.tsx)

**Changes needed:**
- Remove: "API", "Blog" links
- Add: "Privacy Policy", "Terms of Service", "Cookie Policy", "Security"
- Update social links to new ones
- Ensure "Services" and "Careers" are in footer

### 7. Pricing Updates
**Note:** Current pricing from token packs in database should already be correct based on previous migrations. Verify in:
- `supabase/migrations/20251027225415_update_token_allocation_to_message_based.sql`
- Token packs should show: Starter ($2), Popular ($5), Power User ($10), Pro ($20)

### 8. Mobile Responsiveness Audit
**Pages to check:**
- HomePage - ensure all sections stack properly on mobile
- AboutPage - verify timeline/milestones work on small screens
- ContactPage - form should be full-width on mobile
- ServicesPage - grid should be single column on mobile
- CareersPage - job cards should stack on mobile
- PricingPage - pricing cards should stack on mobile

**Common fixes needed:**
```tsx
// Change from:
className="grid grid-cols-3 gap-8"

// To:
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"

// Ensure text sizes scale:
className="text-6xl md:text-7xl"  // Hero headings
className="text-4xl md:text-5xl"  // Section headings
className="text-lg md:text-xl"    // Body text

// Padding adjustments:
className="px-4 md:px-8"
className="py-12 md:py-20"
```

### 9. Documentation Updates
**Files to update:**
- `src/components/Pages/DocsPage.tsx` - Update all stats, pricing, remove OpenRouter mentions
- Any README or markdown files with outdated info

### 10. Stats Updates Everywhere
**Search and replace:**
- "500K+" → "100+"
- "50M+" → "2,500+"
- "99.9%" → "99.5%"
- "4.9/5" → "4.4/5"

**Command to find:**
```bash
grep -r "500K\|50M\|99\.9\|4\.9/5" src/
```

## Implementation Order

1. **High Priority (Do First):**
   - Add Services and Careers to navigation/routing
   - Update footer with legal pages and correct social links
   - Remove OpenRouter mentions from UI
   - Add cookie consent banner

2. **Medium Priority:**
   - Create all 4 legal pages
   - Mobile responsiveness fixes
   - Update remaining stats

3. **Low Priority (Polish):**
   - Fine-tune animations
   - Add more micro-interactions
   - Performance optimizations

## Testing Checklist

- [ ] All navigation links work
- [ ] Services page displays correctly
- [ ] Careers page shows all 10 positions
- [ ] Legal pages are accessible from footer
- [ ] Cookie consent appears for new visitors
- [ ] Social media links point to correct URLs
- [ ] No mention of OpenRouter in visible UI
- [ ] All stats show correct numbers (100+, 2500+, etc.)
- [ ] Mobile view works on all pages
- [ ] Footer has correct links
- [ ] Contact form submits correctly
- [ ] Pricing shows correct amounts
- [ ] Build completes without errors

## Quick Commands

```bash
# Search for things to update
grep -r "500K" src/
grep -r "OpenRouter" src/
grep -r "twitter\|github\|discord" src/ -i

# Build and test
npm run build
npm run dev

# Check for broken links
# (Manual testing in browser)
```

## Notes

- Keep all AI model integrations internal-facing (don't expose implementation details)
- Ensure GDPR compliance in Privacy Policy
- Cookie consent should allow granular control
- Legal pages should be reviewed by legal counsel before launch
- Mobile testing should cover iPhone SE (small), iPhone 12 (medium), iPad (tablet)
- All forms should have proper validation and error handling
