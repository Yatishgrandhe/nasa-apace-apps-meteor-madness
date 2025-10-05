# AI Analysis Setup Guide

This guide explains how to set up the Gemini AI integration for automatic asteroid and comet analysis.

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Gemini AI API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyB42RrQJ3LCmZhX-EvGYNiDNLjr2r3TcIk

# TomTom Maps API Configuration
NEXT_PUBLIC_TOMTOM_API_KEY=Y32adpWPu6FZiymeEGLywvaGqKce0Jva

# NASA API Configuration (optional)
NEXT_PUBLIC_NASA_API_KEY=your_nasa_api_key_here

# Supabase Configuration (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and replace `your_actual_gemini_api_key_here` in your `.env.local` file

## Features

### Automatic AI Analysis
- **Asteroid Detail Pages**: Automatically analyzes individual asteroids when the page loads
- **Comet Detail Pages**: Automatically analyzes individual comets when the page loads
- **Dashboard**: Manual AI analysis for multiple objects

### Impact Prediction Maps
- **Asteroid Detail Pages**: Interactive TomTom maps showing predicted impact locations
- **Real-time Calculations**: Based on orbital mechanics and NASA data
- **Multiple Scenarios**: Nominal, worst-case, and best-case impact predictions
- **Fullscreen Mode**: Full-screen map viewing for detailed analysis

### NASA Eyes Integration
- **Asteroid Detail Pages**: Direct link to specific asteroid in NASA Eyes on the Solar System
- **Comet Detail Pages**: Direct link to specific comet in NASA Eyes on the Solar System
- **Interactive 3D Visualization**: Real-time orbital mechanics and trajectory visualization
- **External Link**: Opens NASA Eyes in new tab for full interactive experience
- **Object-Specific URLs**: Directly navigates to the specific asteroid or comet being viewed

### Analysis Includes
- Risk assessment and threat level
- Potential impact scenarios
- Orbital characteristics analysis
- Historical context and comparison
- Monitoring recommendations
- Future approach predictions
- Scientific significance

### Impact Prediction Features
- **Probability Calculation**: Based on miss distance, velocity, and orbital uncertainty
- **Location Prediction**: Calculates potential impact coordinates using orbital mechanics
- **Energy Assessment**: Estimates impact energy in Megatons TNT equivalent
- **Crater Modeling**: Predicts crater size and depth
- **Affected Area**: Calculates blast radius and thermal effects
- **Geographic Context**: Identifies country and region of potential impact

### NASA Eyes Features
- **Direct Navigation**: Direct links to specific asteroids and comets in NASA Eyes
- **Real-Time Data**: Uses NASA's latest orbital mechanics data
- **3D Visualization**: Interactive 3D view of the solar system
- **Orbital Trajectory**: Shows approach path and future positions
- **Time Controls**: Play, pause, and speed controls for time progression
- **Multiple Views**: Different camera angles and perspectives
- **Object Focus**: Automatic focus on the selected asteroid or comet
- **Full Experience**: Opens in new tab for complete NASA Eyes functionality

### Fallback Behavior
If no API key is provided or the API is unavailable, the system will:
- Display detailed mock analysis based on the object's parameters
- Show appropriate loading states
- Provide error handling with user-friendly messages
- Show placeholder map with impact calculations (TomTom maps require API key)

## Technical Details

### API Integration
- Uses Google's Gemini 1.5 Pro model
- Maximum 3072 tokens for single object analysis
- Temperature set to 0.2 for consistent results
- Automatic retry and error handling with fallback to mock analysis
- TomTom Maps API for interactive impact visualization
- Graceful handling of API failures with detailed error logging

### Data Processing
- Converts NASA API data to analysis format
- Handles both asteroid and comet data structures
- Processes orbital parameters and physical characteristics
- Calculates risk levels based on multiple factors
- Performs orbital mechanics calculations for impact prediction
- Geographic coordinate mapping and location identification

## Usage

1. Set up your environment variables as described above
2. Restart your development server
3. Navigate to any asteroid or comet detail page
4. AI analysis will automatically load and display
5. Impact prediction map will show potential impact locations
6. NASA Eyes link will open the specific object in NASA's 3D visualization
7. Use fullscreen mode for detailed map analysis
8. Switch between different impact scenarios (nominal, worst-case, best-case)
9. Interact with NASA Eyes controls for orbital mechanics exploration

## Troubleshooting

### Common Issues
- **No analysis appears**: Check that your API key is correctly set in `.env.local`
- **Analysis fails**: Verify your Gemini API key is valid and has sufficient quota
- **404 API errors**: Gemini API will automatically fall back to mock analysis
- **403 API errors**: API key may be invalid or lack permissions
- **429 API errors**: Rate limit exceeded, will fall back to mock analysis
- **Slow loading**: Analysis may take 5-10 seconds depending on object complexity
- **Map not loading**: Verify your TomTom API key is correctly set
- **Impact prediction shows "No Impact Predicted"**: Asteroid has very low impact probability (< 0.1%)
- **Fullscreen mode not working**: Check browser permissions for fullscreen API
- **NASA Eyes not loading**: Check if NASA Eyes is accessible and object ID is valid
- **External link not working**: Verify that NASA Eyes website is accessible
- **Chrome third-party cookies warning**: This is normal and doesn't affect functionality

### Debug Mode
Check the browser console for detailed error messages if analysis fails.
