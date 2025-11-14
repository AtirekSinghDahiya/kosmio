# Studio Interface Rebuild Plan

## Current Issues

### Critical Problems:
1. **Landing Page Input Not Working** - Bottom input field doesn't start a chat
2. **Model Cards Failing** - Clicking model cards shows "Failed to create session" errors
3. **No Specialized Studios** - Image/Video/Music open modals or fail, should open dedicated studio interfaces
4. **Missing Side Panels** - No settings panels for image/video/music generation
5. **Code Studio Missing** - No interface matching Google AI Studio's code assistant

## Root Cause Analysis

The current architecture tries to use a unified chat interface for everything, but what's needed is:
- Separate specialized studio views for Image, Video, Music, and Code
- Each studio with its own settings side panel
- Chat models should open clean chat interface
- Landing page input should start a chat with user's initial message

## Required Architecture Changes

### 1. Studio View Components (NEW - Need to Create)

#### A. ImageStudioView Component
**Location:** `/src/components/Studio/ImageStudioView.tsx`

**Features:**
- Main canvas area showing generated image
- Right side panel with settings:
  - Model selector (Flux, DALL-E, Midjourney, SD-XL)
  - Size/Aspect ratio (Square, Portrait, Landscape, Custom)
  - Quality settings (Standard, HD, Ultra)
  - Style presets
  - Number of images (1-4)
- Bottom prompt input
- Generation history on left sidebar
- Download/Share buttons

**Design Reference:** Google AI Studio's image generation interface

#### B. VideoStudioView Component
**Location:** `/src/components/Studio/VideoStudioView.tsx`

**Features:**
- Video preview area
- Right side panel:
  - Provider selector (Sora, Runway, Pika, HeyGen, Veo-3)
  - Duration (2s, 5s, 10s, 20s)
  - Aspect ratio (16:9, 9:16, 1:1)
  - FPS (24, 30, 60)
  - Resolution (720p, 1080p, 4K)
- Prompt input with tips
- Generation queue/history
- Download button

**Design Reference:** Similar to image studio but video-specific

#### C. MusicStudioView Component
**Location:** `/src/components/Studio/MusicStudioView.tsx`

**Features:**
- Audio waveform/player area
- Right side panel:
  - Provider selector (Suno, Udio, ElevenLabs for voice)
  - Style/Genre dropdown
  - Duration slider (30s - 3min)
  - Vocal/Instrumental toggle
  - Mood selector
- Lyrics/Description input
- Generation history with playback
- Download buttons

**Design Reference:** Music creation apps with AI integration

#### D. CodeStudioView Component
**Location:** `/src/components/Studio/CodeStudioView.tsx`

**Features:**
- Split view: Chat on left, Code preview on right
- Chat interface for code requests
- Live code preview/rendering
- Language/framework selector
- Export/Download code
- File tree view for projects

**Design Reference:** EXACTLY match Google AI Studio's code assistant (image 5)

### 2. MainChat Component Updates

**Current Flow (BROKEN):**
```
Landing → Click Model → Try to create project → FAILS
```

**New Flow (WORKING):**
```
Landing Page
  ├─ Click Chat Model → Create project → Show clean chat interface
  ├─ Click Image Model → Show ImageStudioView (no project needed yet)
  ├─ Click Video Model → Show VideoStudioView (no project needed yet)
  ├─ Click Music Model → Show MusicStudioView (no project needed yet)
  ├─ Click Code → Show CodeStudioView (no project needed yet)
  └─ Type in bottom input → Create chat project with initial message
```

### 3. State Management Updates

Add new state to MainChat:
```typescript
const [activeStudio, setActiveStudio] = useState<'chat' | 'image' | 'video' | 'music' | 'code' | null>(null);
const [studioConfig, setStudioConfig] = useState<any>(null);
```

### 4. Landing Page onSelectMode Handler

**Current (BROKEN):**
```typescript
onSelectMode={async (mode, modelId) => {
  // Tries to create project immediately → FAILS
  const project = await createProject(...);
}}
```

**New (WORKING):**
```typescript
onSelectMode={(mode, modelId, initialPrompt?) => {
  if (mode === 'chat') {
    if (initialPrompt) {
      // Create project and send first message
      handleStartChatWithMessage(modelId, initialPrompt);
    } else {
      // Just show empty chat
      setActiveStudio('chat');
      setSelectedModel(modelId);
    }
  } else {
    // Show appropriate studio
    setActiveStudio(mode);
    setStudioConfig({ model: modelId });
  }
}}
```

## Implementation Plan

### Phase 1: Fix Critical Issues (HIGH PRIORITY)
1. ✅ Fix landing page input to start chat with message
2. ✅ Fix model card clicks to not fail
3. ✅ Implement proper studio routing

### Phase 2: Create Studio Views (REQUIRED FOR FUNCTIONALITY)
1. Create ImageStudioView with settings panel
2. Create VideoStudioView with settings panel
3. Create MusicStudioView with settings panel
4. Create CodeStudioView matching Google AI Studio

### Phase 3: Integration & Polish
1. Connect studios to actual API services
2. Add generation history/queue
3. Add download/export functionality
4. Add proper error handling
5. Add loading states and animations

## Immediate Next Steps

### Step 1: Fix MainChat onSelectMode Handler
Remove the project creation that's failing. Instead:
- For chat: Set active studio to 'chat' and show chat interface
- For image/video/music: Set active studio and show placeholder or basic studio
- For code: Set active studio to 'code'

### Step 2: Fix Landing Input
Update `handleInputSubmit` to pass the input text to parent:
```typescript
const handleInputSubmit = () => {
  if (inputValue.trim()) {
    onSelectMode('chat', 'gpt-4o', inputValue);
  }
};
```

Update MainChat to handle initial message:
```typescript
if (mode === 'chat' && initialPrompt) {
  // Create project and immediately send message
  const project = await createProject('Chat', 'chat', initialPrompt);
  setActiveProjectId(project.id);
  // Send the initial message
  await handleSendMessage(initialPrompt);
}
```

### Step 3: Create Basic Studio Shells
Create minimal functional versions of each studio that:
- Show a proper interface (not modals)
- Have settings panels
- Can trigger generation
- Display results

## Files to Modify

1. `/src/components/Chat/MainChat.tsx` - Update routing logic
2. `/src/components/Chat/StudioLandingView.tsx` - Update onSelectMode signature
3. `/src/components/Studio/ImageStudioView.tsx` - CREATE NEW
4. `/src/components/Studio/VideoStudioView.tsx` - CREATE NEW
5. `/src/components/Studio/MusicStudioView.tsx` - CREATE NEW
6. `/src/components/Studio/CodeStudioView.tsx` - CREATE NEW

## Timeline Estimate

- Phase 1 (Critical Fixes): 1-2 hours
- Phase 2 (Studio Views): 4-6 hours
- Phase 3 (Integration): 2-3 hours

**Total: 7-11 hours of focused development**

## Success Criteria

- ✅ Landing page input starts a chat with the typed message
- ✅ Clicking chat models opens clean chat interface
- ✅ Clicking image models opens ImageStudioView with settings panel
- ✅ Clicking video models opens VideoStudioView with settings panel
- ✅ Clicking music models opens MusicStudioView with settings panel
- ✅ Code studio matches Google AI Studio's interface
- ✅ All studios can generate content
- ✅ Token deduction works correctly
- ✅ No more "Failed to create session" errors
