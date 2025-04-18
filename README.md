# 🎵 MoodTune: Emotion-Based Music Recommendation Web App

## Project Scope  
**MoodTune** is a web-based application that detects users' facial emotions in real time and recommends personalized music playlists based on their current mood. By combining facial emotion detection with the Music API(e.g. Apple Music), the platform enhances emotional well-being through tailored music experiences. Additional features include mood tracking, user customization, and a social sharing community.

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
- **Smart Music Recommendation**: Personalized playlists based on the user's mood using mock data.  
- **Mood Smoothing**: Algorithm to stabilize mood fluctuations and prevent frequent playlist changes.  
- **Custom Detection Intervals**: Users can choose how often to detect emotions and update music.  
- **Mood and Music Dashboard**: Visualizes daily and weekly emotional trends along with music history.   
- **Community Sharing**: Share mood trends and playlists with friends, explore others' moods and songs.  

## Project Progress
### Completed Features
- ✅ Basic project structure setup
- ✅ Virtual environment configuration
- ✅ Homepage implementation with modern UI
- ✅ Real-time facial emotion detection using face-api.js
- ✅ Emotion-to-music mapping system
- ✅ Basic music recommendation engine
- ✅ Dashboard with emotion detection and music display
- ✅ Local development environment setup

### In Progress
- 🔄 Integration with music API (e.g., Apple Music)
- 🔄 User authentication system
- 🔄 Mood tracking and history visualization
- 🔄 Community sharing features
- 🔄 Advanced music recommendation algorithms

### Upcoming Features
- ⏳ Social sharing functionality
- ⏳ Advanced mood analytics
- ⏳ User profile customization
- ⏳ Mobile responsiveness optimization
- ⏳ Performance improvements

## Timeline  
| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| Phase 1 | Design the emotion detection system | Week 1–2 | ✅ Completed |
| Phase 2 | Build core features and UI prototype | Week 3–4 | ✅ 50% Completed |
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
- Mock data implementation for testing
- Ready for integration with music APIs

### Development Environment
- Next.js for frontend framework
- TypeScript for type safety
- Tailwind CSS for styling
- Face-api.js for emotion detection
- Local development server support

## Contact Information of the Team
**Developer & Designer**: Ningbo Li (ningbo@uw.edu)  
**Client**: Yishuai Zheng (yishuaiz@uw.edu)

