#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌱 Agri Assist AI - Environment Setup');
console.log('=====================================\n');

const envContent = `# Google AI/Gemini API Key (required for AI features)
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
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Skipping creation.');
  console.log('   If you need to update it, please edit the file manually.\n');
} else {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('   Please edit the file and add your actual API keys.\n');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
    console.log('\nPlease create the file manually with the following content:\n');
    console.log(envContent);
  }
}

console.log('📋 Next Steps:');
console.log('1. Edit .env.local and add your API keys');
console.log('2. Get API keys from:');
console.log('   - Google AI Studio: https://aistudio.google.com/');
console.log('   - OpenWeatherMap: https://openweathermap.org/api');
console.log('   - YouTube Data API: https://console.cloud.google.com/');
console.log('   - Firebase Console: https://console.firebase.google.com/');
console.log('   - Google Maps API: https://console.cloud.google.com/');
console.log('3. Run: npm run dev');
console.log('4. Run: npm run genkit:dev (in another terminal)');
console.log('\n🚀 Happy coding!');
