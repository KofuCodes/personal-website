# Spotify Web API Setup (Alternative to Discord/Lanyard)

This is a more reliable alternative that uses Spotify's official API directly.

## Quick Summary

**Option 1: Spotify Web API (Recommended)**
- ✅ Most reliable
- ✅ Works immediately
- ❌ Requires one-time OAuth setup + serverless function

**Option 2: Keep trying Discord/Lanyard**
- ✅ No setup needed (once working)
- ❌ Can be unreliable, requires waiting

**Option 3: Manual/Static Display**
- ✅ Simplest
- ❌ Not automatic

## Option 1: Spotify Web API Setup

### Step 1: Create Spotify App

1. **Go to Spotify Developer Dashboard:**
   - Visit: https://developer.spotify.com/dashboard
   - **Log in** with your Spotify account (if not already logged in)

2. **Find the "Create App" button:**
   - Look for a green/blue **"Create app"** or **"Create an app"** button
   - It's usually at the top right or center of the dashboard
   - If you don't see it, make sure you're logged in
   - Alternative: Try this direct link: https://developer.spotify.com/dashboard/create

3. **Fill in the form:**
   - **App name**: Your Portfolio (or any name you want)
   - **App description**: Portfolio website (optional but recommended)
   - **What are you building?**: Select "Web App" or "Website"
   - **Redirect URI**: 
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com` (add this after deploying)
   - **Website**: Your portfolio URL (optional)

4. **Accept the terms** and click **"Save"** or **"Create"**

5. **Get your credentials:**
   - After creating, you'll see your app dashboard
   - Copy your **Client ID** (visible on the main page)
   - Click **"Show Client Secret"** and copy your **Client Secret**
   - ⚠️ Keep these secure - don't share them publicly!

### Step 2: Set Environment Variables

Add to `.env.local`:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Set Up Serverless Functions

**For Vercel (Easiest):**
1. Copy `api/spotify-token.ts` and `api/spotify-refresh.ts` to your project
2. Add environment variables in Vercel dashboard:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
3. Deploy to Vercel
4. Update redirect URI in Spotify dashboard to your Vercel URL

**For Netlify:**
1. Create `netlify/functions/` directory
2. Copy the functions there (rename to `.js` or use TypeScript)
3. Add environment variables in Netlify dashboard
4. Deploy

### Step 4: Use the New Component

Replace `SpotifyStatus` with `SpotifyStatusAPI` in `Navbar.tsx`:
```tsx
import SpotifyStatusAPI from './components/SpotifyStatusAPI';
// Then use <SpotifyStatusAPI /> instead of <SpotifyStatus />
```

### Step 5: Authorize (One Time)

1. Visit your site
2. Click "Connect Spotify" button
3. Authorize the app
4. You'll be redirected back and it will work!

## Advantages

✅ More reliable than Lanyard
✅ Works immediately (no waiting)
✅ Official Spotify API
✅ Real-time updates

## Disadvantages

❌ Requires one-time OAuth setup
❌ Needs a serverless function (free on Vercel/Netlify)
❌ Slightly more complex initial setup
