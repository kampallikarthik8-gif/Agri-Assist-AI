# Agri Assist AI

An AI-powered agricultural assistance application built with Next.js, Firebase, and Google AI.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Google AI/Gemini API Key (required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenWeatherMap API Key (required for weather data)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# YouTube API Key (required for YouTube search features)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Firebase Configuration (required for Firebase features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Google Maps API Key (required for map features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Firebase Functions Emulator (optional, for development)
NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR=false
```

### 2. API Keys Setup

#### Google AI/Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` file

#### OpenWeatherMap API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env.local` file

#### YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the YouTube Data API v3
3. Create credentials (API key)
4. Add it to your `.env.local` file

#### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Go to Project Settings > General > Your apps
4. Add a web app and copy the configuration
5. Add the values to your `.env.local` file

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Create credentials (API key)
4. Add it to your `.env.local` file

### 3. Installation and Running

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Run Genkit development server (for AI features)
npm run genkit:dev
```

### 4. Troubleshooting

If you encounter "TypeError: Failed to fetch" errors:

1. **Check Environment Variables**: Ensure all required API keys are set in `.env.local`
2. **API Key Validity**: Verify that your API keys are valid and have the necessary permissions
3. **Network Issues**: Check your internet connection and firewall settings
4. **CORS Issues**: Ensure your API keys allow requests from localhost:3000

### Features

- Weather monitoring and alerts
- Pest and disease detection
- Crop recommendations
- Government scheme information
- Market prices
- Irrigation planning
- Document management
- AI-powered chat assistant

To get started, take a look at src/app/page.tsx.
