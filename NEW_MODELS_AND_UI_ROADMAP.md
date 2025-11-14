# New AI Models & UI Redesign Implementation

## Date: November 14, 2025

---

## ✅ COMPLETED: New AI Models Added (Phase 1)

### Models Successfully Added:

#### 1. **MiniMax Models** (3 models)
- **minimax/minimax-01** - Multimodal model with vision
  - Tokens: 2,500 per message
  - Tier: Budget
  - Logo: MiniMax GitHub avatar

- **minimax/minimax-m2** - Advanced reasoning model
  - Tokens: 4,500 per message
  - Tier: Mid
  - Logo: MiniMax GitHub avatar

- **minimax/minimax-m1** - General purpose model
  - Tokens: 3,000 per message
  - Tier: Budget
  - Logo: MiniMax GitHub avatar

#### 2. **Amazon Nova Models** (3 additional models)
- **amazon/nova-lite-v1** - Fast multimodal with vision
  - Tokens: 2,000 per message
  - Tier: Budget
  - Logo: Amazon official logo

- **amazon/nova-micro-v1** - Ultra-fast text model
  - Tokens: 1,200 per message
  - Tier: FREE
  - Logo: Amazon official logo

- **amazon/nova-pro-v1** - Professional multimodal AI
  - Tokens: 8,000 per message
  - Tier: Mid
  - Logo: Amazon official logo

#### 3. **Baidu ERNIE Models** (4 models)
- **baidu/ernie-4.5-21b-a3b** - Efficient reasoning model
  - Tokens: 3,500 per message
  - Tier: Budget
  - Logo: Baidu official logo

- **baidu/ernie-4.5-vl-28b-a3b** - Vision-language model
  - Tokens: 4,500 per message
  - Tier: Mid
  - Logo: Baidu official logo

- **baidu/ernie-4.5-vl-424b-a47b** - Large vision-language model
  - Tokens: 12,000 per message
  - Tier: Premium
  - Logo: Baidu official logo

- **baidu/ernie-4.5-300b-a47b** - Massive reasoning model
  - Tokens: 15,000 per message
  - Tier: Premium
  - Logo: Baidu official logo

#### 4. **OpenRouter Auto** (1 model)
- **openrouter/auto** - Automatically picks best model
  - Tokens: 2,000 per message
  - Tier: Budget
  - Logo: OpenRouter favicon

### Total: **11 New Models Added**

###  **Removed Models:**
- ❌ **LiquidAI LFM2-8B** - Removed as requested

---

## ✅ Files Modified:

1. **`src/components/Chat/AIModelSelector.tsx`**
   - Added 11 new AI models
   - Removed LiquidAI model
   - Organized models by provider with comments

2. **`src/lib/modelTokenPricing.ts`**
   - Added pricing for all 11 new models
   - Added official logos from company websites/GitHub
   - Configured appropriate token costs per model tier

---

## 🚧 PENDING: Major UI Redesign (Phase 2)

### Google AI Studio-Inspired UI Changes Needed:

#### 1. Profile Button (Top Right)
**Status:** NOT YET IMPLEMENTED
**Requirements:**
- Create `ProfileButton.tsx` component
- Position in top-right corner of FloatingNavbar
- Display user avatar/initials
- Show token balance indicator
- Click opens profile modal/page

**Design:**
```tsx
<button className="profile-btn">
  <Avatar src={user.photoURL} />
  <TokenBadge tokens={tokenBalance} />
</button>
```

---

#### 2. Right Sidebar Panel (Settings)
**Status:** NOT YET IMPLEMENTED
**Requirements:**
- Create `ChatSettingsPanel.tsx` component
- Fixed right sidebar (350-400px width)
- Replaces current top navbar

**Panel Contents:**
- Model name and description at top
- System instructions textarea
- Temperature slider
- Aspect ratio selector (for images/video)
- Advanced settings (collapsible)
- Model-specific parameters
- Response length settings

**Design Reference:** See Google AI Studio screenshot #1

**Implementation Notes:**
```tsx
<aside className="fixed right-0 top-0 h-screen w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 p-6">
  <div className="model-info">
    <h2>{selectedModel.name}</h2>
    <p>{selectedModel.description}</p>
  </div>

  <div className="system-instructions mt-6">
    <label>System Instructions</label>
    <textarea placeholder="Optional tone and style instructions..." />
  </div>

  <div className="temperature-control mt-4">
    <label>Temperature</label>
    <input type="range" min="0" max="2" step="0.1" />
  </div>

  <div className="advanced-settings mt-6">
    <details>
      <summary>Advanced settings</summary>
      {/* More controls */}
    </details>
  </div>
</aside>
```

---

#### 3. Landing View Redesign
**Status:** NOT YET IMPLEMENTED
**Requirements:**
- Create tab navigation: Featured | Gemini | Images | Video | Audio
- Redesign model cards to horizontal layout

**Tab System:**
```tsx
<div className="tabs">
  <button className="tab active">Featured</button>
  <button className="tab">Gemini</button>
  <button className="tab">Images</button>
  <button className="tab">Video</button>
  <button className="tab">Audio</button>
</div>
```

**Featured Tab:**
- Show 3-5 recommended models
- Horizontal cards with model icon on left
- Model name + description
- "NEW" badge for recent models
- Copy/bookmark icons on right

**Design Reference:** See Google AI Studio screenshot #2

**Card Layout:**
```tsx
<div className="model-card horizontal">
  <div className="icon-container">
    <img src={model.logoUrl} alt={model.name} />
  </div>
  <div className="info-container flex-1">
    <div className="header">
      <h3>{model.name} {model.isNew && <span className="badge-new">New</span>}</h3>
    </div>
    <p className="description">{model.description}</p>
  </div>
  <div className="actions">
    <button className="icon-btn"><Copy /></button>
    <button className="icon-btn"><BookmarkIcon /></button>
  </div>
</div>
```

---

#### 4. Video Generation UI Redesign
**Status:** NOT YET IMPLEMENTED
**Requirements:**
- Show example video thumbnails in grid
- Add video settings in right sidebar
- Aspect ratio buttons (16:9, 9:16)
- Duration selector
- Frame rate selector
- Output resolution dropdown

**Design Reference:** See Google AI Studio screenshot #3

**Layout:**
```tsx
<div className="video-generation">
  <h1>Generate videos with Veo</h1>

  <div className="examples-grid">
    <div className="example-card">
      <video poster={thumbnail} />
      <p className="prompt">Animate an image</p>
    </div>
    <div className="example-card">
      <video poster={thumbnail} />
      <p className="prompt">Create a video with an image...</p>
    </div>
    {/* More examples */}
  </div>

  <div className="prompt-input">
    <textarea placeholder="Describe your video" />
    <button className="run-btn">Run</button>
  </div>
</div>

{/* Right Sidebar */}
<aside className="video-settings">
  <h3>Veo 2</h3>
  <p className="subtitle">veo-2-0-generate-001</p>

  <div className="setting">
    <label>Number of results</label>
    <input type="number" value="1" />
  </div>

  <div className="setting">
    <label>Aspect ratio</label>
    <div className="aspect-buttons">
      <button className="active">
        <Monitor /> 16:9
      </button>
      <button>
        <Smartphone /> 9:16
      </button>
    </div>
  </div>

  <div className="setting">
    <label>Video duration</label>
    <select>
      <option>8s</option>
      <option>16s</option>
    </select>
  </div>

  <div className="setting">
    <label>Frame rate</label>
    <select>
      <option>24 fps</option>
      <option>30 fps</option>
    </select>
  </div>
</aside>
```

---

#### 5. Audio/Voice Generation UI Redesign
**Status:** NOT YET IMPLEMENTED
**Requirements:**
- Multi-speaker mode toggle
- Speaker settings with voice dropdown
- Style instructions
- Waveform visualization

**Design Reference:** See Google AI Studio screenshot #4

**Layout:**
```tsx
<div className="audio-generation">
  <div className="mode-selector">
    <button className="mode-btn active">
      <User /> Single-speaker audio
    </button>
    <button className="mode-btn">
      <Users /> Multi-speaker audio
    </button>
  </div>

  <div className="speaker-settings">
    <div className="speaker-card">
      <div className="speaker-indicator yellow">🟡 Speaker 1</div>
      <div className="settings-group">
        <label>Name</label>
        <input type="text" value="Speaker 1" />
      </div>
      <div className="settings-group">
        <label>Voice</label>
        <select>
          <option>Zephyr</option>
          <option>Aurora</option>
          <option>Sage</option>
        </select>
      </div>
    </div>

    <div className="speaker-card">
      <div className="speaker-indicator purple">🟣 Speaker 2</div>
      {/* Same structure */}
    </div>
  </div>

  <div className="style-instructions">
    <label>Style instructions</label>
    <input placeholder="Read aloud in a warm, welcoming tone" />
  </div>

  <button className="add-dialog">+ Add dialog</button>

  <button className="run-btn">Run</button>
</div>
```

---

## 🎨 Design System Updates Needed:

### Color Palette:
- Primary: Cyan/Blue gradient
- Secondary: Purple accents (minimal use per your preference)
- Background: Dark slate (slate-900/95)
- Borders: white/10 opacity
- Text: White with varying opacity

### Typography:
- Headers: font-bold, text-lg to text-3xl
- Body: font-medium, text-sm to text-base
- Labels: font-semibold, text-xs, uppercase, tracking-wider

### Spacing:
- Use consistent 8px spacing system
- Padding: p-4, p-6, p-8
- Gaps: gap-2, gap-4, gap-6

### Components:
- Buttons: rounded-xl, backdrop-blur-xl
- Cards: bg-slate-900/90, border border-white/10
- Inputs: bg-white/5, border border-white/10, rounded-lg
- Dropdowns: rounded-xl shadow-2xl backdrop-blur-2xl

---

## 📁 New Components to Create:

1. **`ProfileButton.tsx`** - Top-right user profile button
2. **`ChatSettingsPanel.tsx`** - Right sidebar for model settings
3. **`TabNavigation.tsx`** - Featured/Gemini/Images/Video/Audio tabs
4. **`HorizontalModelCard.tsx`** - Google AI Studio style model cards
5. **`VideoGenerationView.tsx`** - Video generation with examples
6. **`AudioGenerationView.tsx`** - Audio/voice generation interface
7. **`AspectRatioSelector.tsx`** - 16:9 / 9:16 buttons
8. **`SpeakerSettings.tsx`** - Multi-speaker audio controls

---

## 🔧 Components to Modify:

1. **`FloatingNavbar.tsx`**
   - Remove or minimize
   - Add ProfileButton to top-right
   - Potentially remove entirely if using sidebar

2. **`MainChat.tsx`**
   - Integrate ChatSettingsPanel on right side
   - Adjust layout to accommodate sidebar
   - Remove top model selector (moved to sidebar)

3. **`LandingView.tsx`**
   - Add tab navigation
   - Replace current quick action cards
   - Implement horizontal model cards
   - Different content per tab

4. **`VideoGenerator.tsx`**
   - Show example thumbnails
   - Add prompt-based interface
   - Integrate with ChatSettingsPanel

5. **`VoiceoverGenerator.tsx`**
   - Add multi-speaker mode
   - Speaker settings cards
   - Style instructions input

---

## 📊 Implementation Estimates:

| Component | Complexity | Time Estimate |
|-----------|------------|---------------|
| ProfileButton | Low | 30 min |
| ChatSettingsPanel | Medium | 2 hours |
| Tab Navigation | Low | 1 hour |
| Landing View Redesign | High | 3 hours |
| Video UI Redesign | Medium | 2 hours |
| Audio UI Redesign | Medium | 2 hours |
| Integration & Testing | High | 2 hours |

**Total Estimated Time:** ~12-15 hours

---

## 🚀 Recommended Implementation Order:

### Phase 2A (Quick Wins):
1. Add ProfileButton component (top-right)
2. Update CompactModelSelector styling to be even neater
3. Test new models are working correctly

### Phase 2B (Core UI):
4. Create ChatSettingsPanel (right sidebar)
5. Integrate sidebar into MainChat
6. Remove/minimize FloatingNavbar

### Phase 2C (Landing Redesign):
7. Create TabNavigation component
8. Create HorizontalModelCard component
9. Redesign LandingView with tabs
10. Populate each tab with appropriate content

### Phase 2D (Media Generation):
11. Redesign VideoGenerator with thumbnails
12. Redesign VoiceoverGenerator with multi-speaker
13. Add settings panels for each media type

### Phase 2E (Polish):
14. Refine animations and transitions
15. Test responsiveness on all screen sizes
16. Ensure gradient theme is consistent
17. Build and deploy

---

## 💡 Current Status Summary:

### ✅ What's Working:
- All 11 new AI models added and configured
- LiquidAI removed
- Token pricing configured
- Logos added for all providers
- CompactModelSelector displaying all models
- Build successful (1,402 kB main bundle)

### 🚧 What's Pending:
- Profile button in top-right
- Right sidebar settings panel
- Landing page tab system
- Horizontal model cards
- Video generation UI with thumbnails
- Audio generation UI with multi-speaker
- Overall Google AI Studio aesthetic

### 🎯 Next Steps:
1. Review this document
2. Decide on implementation order
3. Begin Phase 2A (Profile Button)
4. Continue through phases systematically

---

## 📝 Notes for Implementation:

### OpenRouter Integration:
All new models use OpenRouter API with the pattern:
```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': YOUR_SITE_URL,
    'X-Title': YOUR_SITE_NAME,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'minimax/minimax-01', // or any other model ID
    messages: [...]
  })
});
```

### Special Cases:

**MiniMax M2 (Reasoning Model):**
```javascript
// Requires special reasoning parameter
{
  model: 'minimax/minimax-m2',
  messages: [...],
  reasoning: { enabled: true }
}

// Response includes reasoning_details that should be preserved
response.choices[0].message.reasoning_details
```

**OpenRouter Auto:**
- Automatically selects best model for the task
- No special parameters needed
- Cost varies based on selected model

---

## 🎨 Visual Style Guide:

### Gradient Theme:
```css
/* Primary Gradient */
background: linear-gradient(to right, from-cyan-500/20 to-blue-500/20)

/* Card Gradient */
background: linear-gradient(to right, from-slate-900/95 to-slate-800/95)

/* Hover Gradient */
background: linear-gradient(to right, from-cyan-500/30 to-blue-500/30)

/* Border Gradient */
border-image: linear-gradient(to right, cyan, blue) 1
```

### Glass Morphism:
```css
backdrop-filter: blur(20px)
background: rgba(15, 23, 42, 0.95)
border: 1px solid rgba(255, 255, 255, 0.1)
```

### Shadows:
```css
/* Light Shadow */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

/* Medium Shadow */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2)

/* Glow Effect */
box-shadow: 0 0 20px rgba(0, 255, 240, 0.3)
```

---

## 🔗 Useful Resources:

- **MiniMax Logos:** https://avatars.githubusercontent.com/u/149157846
- **Amazon Logos:** https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg
- **Baidu Logos:** https://upload.wikimedia.org/wikipedia/commons/5/5a/Baidu_logo.svg
- **OpenRouter:** https://openrouter.ai/favicon-32x32.png

---

## ✨ End Goal:

A production-ready AI chat interface that:
- Supports 50+ AI models including all new additions
- Features Google AI Studio-inspired design
- Provides intuitive media generation workflows
- Maintains consistent gradient theme throughout
- Offers professional, polished user experience
- Performs well on all devices

---

**Document Version:** 1.0
**Last Updated:** November 14, 2025
**Status:** Models Complete | UI Redesign Pending
