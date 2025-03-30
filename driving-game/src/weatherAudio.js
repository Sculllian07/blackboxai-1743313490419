export class WeatherAudio {
    constructor() {
        this.sounds = {
            rain: { volume: 0, howl: null, hasAudio: false },
            wind: { volume: 0, howl: null, hasAudio: false },
            thunder: [
                { howl: null, lastPlayed: 0, hasAudio: false },
                { howl: null, lastPlayed: 0, hasAudio: false }
            ]
        };
        
        // Initialize Howler if available
        if (window.Howl) {
            try {
                this.sounds.rain.howl = new Howl({
                    src: ['sounds/rain.mp3'],
                    loop: true,
                    volume: 0,
                    onload: () => this.sounds.rain.hasAudio = true,
                    onloaderror: () => console.warn('Rain sound not available - using visual only'),
                    onplayerror: () => console.warn('Failed to play rain sound')
                });
                this.sounds.wind.howl = new Howl({
                    src: ['sounds/wind.mp3'],
                    loop: true,
                    volume: 0,
                    onload: () => this.sounds.wind.hasAudio = true,
                    onloaderror: () => console.warn('Wind sound not available - using visual only'),
                    onplayerror: () => console.warn('Failed to play wind sound')
                });
                // Thunder sounds
                this.sounds.thunder[0].howl = new Howl({
                    src: ['sounds/thunder1.mp3'],
                    onload: () => this.sounds.thunder[0].hasAudio = true,
                    onloaderror: () => console.warn('Thunder1 sound not available - using visual only')
                });
                this.sounds.thunder[1].howl = new Howl({
                    src: ['sounds/thunder2.mp3'],
                    onload: () => this.sounds.thunder[1].hasAudio = true,
                    onloaderror: () => console.warn('Thunder2 sound not available - using visual only')
                });
            } catch (e) {
                console.error('Audio initialization error:', e);
            }
        }
    }

    playRandomThunder(intensity) {
        const now = Date.now();
        const available = this.sounds.thunder.filter(
            t => now - t.lastPlayed > 10000
        );
        
        if (available.length > 0) {
            const thunder = available[Math.floor(Math.random() * available.length)];
            if (thunder.hasAudio && thunder.howl) {
                thunder.howl.volume(0.5 + Math.random() * 0.5 * intensity);
                thunder.howl.play();
            }
            thunder.lastPlayed = now;
            return true; // Return true if thunder triggered (even without sound)
        }
        return false;
    }

    update(weatherType, intensity = 1) {
        if (!window.Howl) return;

        // Target volumes based on weather
        const targets = {
            DRY: { rain: 0, wind: 0.2, thunder: 0 },
            WET: { rain: 0.3, wind: 0.4, thunder: 0 },
            RAINY: { rain: 0.7, wind: 0.8, thunder: 1 }
        };

        // Random thunder during rain
        if (weatherType === 'RAINY' && Math.random() < 0.005 * intensity) {
            if (this.playRandomThunder(intensity)) {
                // Notify WeatherSystem to trigger lightning
                if (this.onThunder) this.onThunder(intensity);
            }
        }

        // Smoothly adjust volumes
        for (const [type, sound] of Object.entries(this.sounds)) {
            const targetVol = targets[weatherType][type] * intensity;
            sound.volume = lerp(sound.volume, targetVol, 0.1);
            if (sound.howl) {
                sound.howl.volume(sound.volume);
                // Ensure sounds are playing
                if (targetVol > 0 && !sound.howl.playing() && sound.hasAudio) {
                    sound.howl.play();
                }
            }
        }
    }
}

// Linear interpolation helper
function lerp(a, b, t) {
    return a + (b - a) * t;
}