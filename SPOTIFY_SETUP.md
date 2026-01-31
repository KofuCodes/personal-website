# Spotify Integration Setup Guide

This guide explains how to set up the Spotify "Now Playing" feature on your portfolio website.

## How It Works

The website uses the **Lanyard API** to fetch your current Spotify listening status through Discord. When you're listening to music on Spotify and have Discord connected, visitors can see what you're playing and click to play it directly on the website.

## Setup Steps

### 1. Connect Spotify to Discord

1. Open **Discord** (desktop or web app)
2. Go to **User Settings** (gear icon)
3. Navigate to **Connections**
4. Click **Spotify** and authorize the connection
5. Make sure **Display Spotify as your status** is enabled

### 2. Get Your Discord User ID

Your Discord User ID is already set in the code (`components/SpotifyStatus.tsx`):
```typescript
const DISCORD_ID = "369238803656998912";
```

**To find or update your Discord ID:**
1. Enable Developer Mode in Discord:
   - Go to **User Settings** → **Advanced**
   - Enable **Developer Mode**
2. Right-click on your profile/username
3. Click **Copy ID**
4. Update the `DISCORD_ID` constant in `components/SpotifyStatus.tsx`

**⚠️ IMPORTANT: Lanyard API Requirements:**
- You must be a member of at least one Discord server for Lanyard to track you
- The API only works if you're in a server (it doesn't track DMs or private messages)
- Make sure you're in at least one public or private Discord server
- **You need to be ACTIVE in the server** - Lanyard needs to "discover" you first:
  - Send a message in the server, OR
  - Join a voice channel, OR
  - Be active in the server for a few minutes
- After being active, wait 2-5 minutes for Lanyard to start monitoring you

### 3. Make Your Discord Status Visible

For the Lanyard API to work, you need to:
1. Make sure your Discord status is set to **Online** (not Invisible)
2. Have Spotify playing on a device connected to your Discord account
3. The Lanyard API will automatically detect your Spotify activity

## How It Works for Visitors

1. **When you're listening to music:**
   - Visitors see a green pulsing indicator
   - They see the song name and artist
   - They can click on it to open a player modal

2. **When you're not listening:**
   - Visitors see "Currently Offline" status

3. **Playing music:**
   - Clicking the status opens a modal with an embedded Spotify player
   - Visitors can play the track directly (requires Spotify account for full playback)
   - They can also open it in Spotify app/web

## Testing

1. Start playing music on Spotify (desktop app, web player, or mobile)
2. Make sure Discord is connected to Spotify and showing your status
3. Visit your website - you should see the "Now Listening" status
4. Click on it to test the player modal

## Troubleshooting

### Status not showing? Follow these steps:

1. **Test the API directly:**
   - Open this URL in your browser: `https://api.lanyard.rest/v1/users/369238803656998912`
   - If you get a 404 error, it means:
     - Your Discord ID might be incorrect
     - You might not be in any Discord servers (Lanyard requires you to be in at least one server)
     - Try joining a public Discord server and test again
   - If successful, check if `listening_to_spotify` is `true` and if there's Spotify data

2. **Common issues and fixes:**
   - ✅ **Discord is connected but still offline?**
     - Make sure Spotify is **actively playing** (not paused)
     - Restart Discord after connecting Spotify
     - Check Discord Settings → Connections → Spotify → "Display Spotify as your status" is ON
   
   - ✅ **Discord status is "Invisible"?**
     - Change your Discord status to "Online" (Lanyard API doesn't work with Invisible status)
   
   - ✅ **Spotify is playing but not showing?**
     - Make sure you're playing on a device that's connected to Discord (desktop app works best)
     - Try disconnecting and reconnecting Spotify in Discord
     - Wait 10-30 seconds for the API to update
   
   - ✅ **Getting "user_not_monitored" error?**
     - This means Lanyard hasn't discovered you yet
     - **Join a Discord server** (any server works - public or private)
     - **Be active in the server**: Send a message, join a voice channel, or just be online
     - **Wait 2-5 minutes** for Lanyard to start monitoring you
     - Make sure your Discord status is "Online" (not Invisible)
     - Test the API again: `https://api.lanyard.rest/v1/users/YOUR_DISCORD_ID`
   
   - ✅ **Still not working?**
     - Check the browser console (F12) for error messages
     - Verify your Discord ID is correct (enable Developer Mode, right-click profile → Copy ID)
     - Make sure Discord Rich Presence is enabled (Settings → Activity Privacy → Allow game activity)
     - Try joining a popular public Discord server to ensure Lanyard can track you

3. **Debug mode:**
   - When running on `localhost`, the component shows debug information
   - Check the browser console for detailed API responses
   - Look for any error messages

**Player not working:**
- The embedded player requires visitors to have a Spotify account for full playback
- Preview playback (30 seconds) works without an account
- Make sure the track_id is valid

## Advanced: Using Your Own Spotify API (Optional)

If you want more control, you can set up your own Spotify API integration:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Get your Client ID and Client Secret
4. Set up OAuth flow for Web Playback SDK
5. This requires backend implementation for secure token handling

The current implementation uses Lanyard API (via Discord) which is simpler and doesn't require API keys.

## Current Configuration

- **Discord ID**: `301825150244683777` (update in `components/SpotifyStatus.tsx`)
- **Update Interval**: 30 seconds
- **API**: Lanyard REST API (`https://api.lanyard.rest/v1/users/{DISCORD_ID}`)

## Notes

- The status updates automatically every 30 seconds
- The player uses Spotify's embed player (iframe)
- Full playback requires visitors to have Spotify accounts
- Preview playback (30 seconds) works for everyone
