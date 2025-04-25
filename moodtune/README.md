# MoodTune - Emotion-Based Music Recommendation System

MoodTune is an intelligent music recommendation system developed with Next.js that analyzes users' facial expressions to recommend music matching their current mood.

## Features

- Real-time facial emotion recognition
- Emotion-based intelligent music recommendations
- Music playback using Spotify Web Playback SDK
- Playback controls (play/pause, previous/next)
- Real-time playback progress display

## Requirements

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Spotify Premium account (for music playback functionality)
- ngrok (for local development)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd moodtune
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install ngrok:
```bash
npm install -g ngrok
# or
brew install ngrok
```

4. Configure environment variables:
Create a `.env.local` file in the project root directory with the following content:
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

5. Configure Spotify Developer Dashboard:
- Log in to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Create a new application
- Set the redirect URI to `http://localhost:3000/api/auth/callback`
- Get the Client ID and add it to the `.env.local` file

## Running the Project

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. In a new terminal, start ngrok:
```bash
ngrok http 3000
```

3. Update Spotify Developer Dashboard:
- Copy the HTTPS URL provided by ngrok (e.g., `https://xxxx-xx-xx-xxx-xx.ngrok.io`)
- Add this URL to your Spotify app's redirect URIs in the Developer Dashboard
- Update the `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` in `.env.local` to match the ngrok URL

4. Access in your browser:
```
https://xxxx-xx-xx-xxx-xx.ngrok.io
```

5. Usage Instructions:
- First-time access requires Spotify account login
- Ensure you're using a Spotify Premium account for full functionality
- Allow browser access to camera for emotion recognition
- Click "Start Detection" to begin emotion analysis
- System will recommend music based on detected emotions
- Click on recommended songs to start playback

## Project Structure

```
moodtune/
├── src/
│   ├── app/              # Next.js app routing
│   ├── components/       # React components
│   ├── services/         # Service layer (music recommendation, emotion detection)
│   └── utils/            # Utility functions
├── public/               # Static assets
└── package.json          # Project dependencies
```

## Tech Stack

- Next.js 14
- React
- TypeScript
- Spotify Web Playback SDK
- Face-API.js (emotion detection)
- Tailwind CSS

## Notes

- Ensure using HTTPS or localhost environment
- Stable internet connection required for Spotify API access
- Chrome browser recommended for optimal experience
- First-time use may require camera and microphone access permissions

## FAQ

1. Music won't play?
   - Verify Spotify Premium account login
   - Check internet connection
   - Try refreshing the page and logging in again

2. Emotion detection not accurate?
   - Ensure good lighting conditions
   - Keep face within camera frame
   - Avoid rapid movements

## Contributing

Issues and Pull Requests are welcome to help improve the project.

## License

MIT License
