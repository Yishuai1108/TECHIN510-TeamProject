# 🎵 MoodTune: Emotion-Based Music Recommendation Web App

## Project Scope  
**MoodTune** is a web-based application that detects users' facial emotions in real time and recommends personalized music playlists based on their current mood. By combining facial emotion detection with the Spotify API, the platform enhances emotional well-being through tailored music experiences. Additional features include mood tracking, user customization, and a social sharing community.

Main components:
- Real-time facial emotion detection system
- Emotion-driven music recommendation engine
- Mood smoothing algorithm to prevent erratic music changes
- Customizable detection frequency settings
- Community-based sharing of mood trends and playlists

## Target Users  
MoodTune is designed for:
- Music enthusiasts who enjoy discovering new sounds based on emotion  
- People who use music for relaxation, focus, or emotional regulation  
- Users who want to monitor their mood trends and music habits  
- Social users who like sharing music and emotional states with friends  

## Features  
- **Facial Emotion Detection**: Real-time emotion recognition using face-api.js via camera.  
- **Smart Music Recommendation**: Personalized playlists based on the user's mood using Spotify API.  
- **Mood Smoothing**: Algorithm to stabilize mood fluctuations and prevent frequent playlist changes.  
- **Custom Detection Intervals**: Users can choose how often to detect emotions and update music.  
- **Mood and Music Dashboard**: Visualizes daily and weekly emotional trends along with music history.   
- **Community Sharing**: Share mood trends and playlists with friends, explore others' moods and songs.  
- **Music Playback & Controls**: Web-based playback using Spotify Web Playback SDK, including play/pause, next/previous, and draggable progress bar.
- **Modern Responsive UI**: Built with Tailwind CSS, features a fixed bottom player, card-style recommendations, and a top navigation bar.
- **User Authentication**: Spotify login and token management.

## Project Progress
### Completed Features
- ✅ Basic project structure setup
- ✅ Local development environment setup
- ✅ Homepage implementation with modern UI
- ✅ Real-time facial emotion detection using face-api.js
- ✅ Emotion-to-music mapping system
- ✅ Music recommendation engine (Spotify API)
- ✅ Dashboard with emotion detection and music display
- ✅ Music playback and controls (Spotify Web Playback SDK)
- ✅ Navigation bar for page switching
- ✅ Progress bar with drag-to-seek support

### In Progress
- 🔄 User settings
- 🔄 Community sharing features


## Timeline  
| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| Phase 1 | Design the emotion detection system | Week 1–2 | ✅ Completed |
| Phase 2 | Build core features and UI prototype | Week 3–4 | ✅ Completed |
| Phase 3 | Test and iterate | Week 5 | 🔄 In Progress |
| Phase 4 | UI polish and frontend integration | Week 6 | ⏳ Upcoming |
| Phase 5 | Final development and deployment | Week 7–8 | ⏳ Upcoming |

## Technical Implementation
### Emotion Detection
- Utilizes face-api.js for real-time facial expression recognition
- Supports 7 basic emotions: happy, sad, angry, surprised, fearful, disgusted, and neutral
- Confidence threshold of 0.5 for emotion detection
- Real-time video processing using canvas

### Music Recommendation
- Emotion-to-genre mapping system
- Spotify API integration for real music data
- Each recommendation: 10 random tracks from 50 candidates

### Music Playback
- Spotify Web Playback SDK integration
- Play/pause, next/previous, and draggable progress bar
- Fixed bottom player UI

### Development Environment
- Next.js for frontend framework
- TypeScript for type safety
- Tailwind CSS for styling
- face-api.js for emotion detection
- Local development server support

## Contact Information of the Team
**Developer & Designer**: Ningbo Li (ningbo@uw.edu)  
**Client**: Yishuai Zheng (yishuaiz@uw.edu)

