# Weather System Documentation

## Core Components

1. **Weather States**
   - Dry: Minimal effects, high road roughness
   - Wet: Light rain, moderate reflections  
   - Rainy: Heavy rain, strong wind, high reflections

2. **Visual Effects**
   - Rain particles with wind influence
   - Lightning flashes
   - Screen shake during thunder
   - Road wetness reflections

3. **Audio System**
   - Rain and wind loops
   - Thunderclaps with cooldown
   - Graceful fallback when audio missing

## Configuration

```javascript
// In weather.js
weatherStates: {
  DRY: { 
    roughness: 0.8,  // Road texture
    reflection: 0.2, // Environment map intensity  
    wind: 0.1        // Wind strength
  },
  // ... other states
}

// In weatherAudio.js  
audioParams: {
  rain: { volume: 0.7 },
  wind: { volume: 0.8 },
  thunder: { 
    minDelay: 10, // seconds
    intensity: 1 
  }
}
```

## API Reference

### WeatherSystem Class
- `setWeather(type)`: Transition to new weather state
- `update(deltaTime)`: Update all weather effects
- `screenShake`: Controls camera shake effects

### Public Events
- `onThunder`: Callback when thunder occurs

## Advanced Configuration

### Custom Weather States
```javascript
// Add new weather type
weatherSystem.weatherStates.FOGGY = {
  roughness: 0.3,
  reflection: 0.4, 
  wind: 0.2
};

// Set custom transition duration
weatherSystem.transitionDuration = 3; // seconds
```

### Performance Optimization
```javascript
// In rain.js
export const RAIN_PARTICLE_COUNT = 1000; // Reduce for better performance

// In weather.js
export const MAX_SCREEN_SHAKE = 0.2; // Lower values reduce intensity
```

## Usage Examples

### Changing Weather
```javascript
// Transition to rainy weather
weatherSystem.setWeather('RAINY');

// Listen for thunder events
weatherSystem.audio.onThunder = (intensity) => {
  console.log(`Thunder with intensity ${intensity}`);
};
```

## Troubleshooting

**Common Issues**
1. **Missing Audio**
   - Verify sound files exist in /sounds/
   - Check browser console for loading errors
   - Ensure Howler.js is loaded before initialization

2. **Performance Problems**  
   - Reduce RAIN_PARTICLE_COUNT in rain.js
   - Lower MAX_SCREEN_SHAKE in weather.js
   - Disable reflections in config.js:
     ```javascript
     renderer.envMapIntensity = 0.5; // Lower value
     ```

3. **Visual Glitches**
   - Check WebGL support
   - Verify texture loading
   - Ensure proper asset paths

## Version History

### 1.0.0 (Current)
- Initial release with Dry/Wet/Rainy states
- Complete audio-visual weather system
- Screen shake effects
- Performance optimizations

## Quick Start Guide

1. **Initialization**
```javascript
import { WeatherSystem } from './src/weather.js';

const weather = new WeatherSystem(scene, roadSystem);
weather.screenShake = new ScreenShake(camera);
```

2. **Basic Usage**
```javascript
// Set weather state
weather.setWeather('RAINY');

// Update in game loop
weather.update(deltaTime);
```

3. **Extending**
```javascript
// Add new weather type
weather.weatherStates.SNOWY = {
  roughness: 0.6,
  reflection: 0.3,
  wind: 0.4
};
```
