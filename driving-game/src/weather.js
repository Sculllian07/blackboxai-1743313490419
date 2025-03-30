const THREE = window.THREE;
import { RainSystem } from './rain.js';
import { WindVisual } from './windVisual.js';
import { WeatherAudio } from './weatherAudio.js';
import { LightningEffects } from './lightningEffects.js';
import { ScreenShake } from './screenShake.js';

export class WeatherSystem {
    constructor(scene, roadSystem) {
        this.scene = scene;
        this.roadSystem = roadSystem;
        this.rainSystem = new RainSystem(scene);
        this.windVisual = new WindVisual(scene);
        this.audio = new WeatherAudio();
        this.audio.onThunder = (intensity) => {
            this.lightning.flash(intensity);
            if (this.screenShake) {
                this.screenShake.shake(intensity * 0.15, 600);
            }
        };
        this.lightning = new LightningEffects();
        this.currentWeather = 'DRY';
        this.wind = {
            direction: new THREE.Vector3(1, 0, 0).normalize(),
            intensity: 0
        };
        this.weatherStates = {
            DRY: { roughness: 0.8, reflection: 0.2, wind: 0.1 },
            WET: { roughness: 0.1, reflection: 0.5, wind: 0.3 },
            RAINY: { roughness: 0.05, reflection: 0.8, wind: 0.7 }
        };
        this.transitionDuration = 5; // seconds
    }

    setWeather(weatherType) {
        if (!this.weatherStates[weatherType] || this.currentWeather === weatherType) return;
        
        this.transitionTarget = weatherType;
        this.transitionProgress = 0;
        this.currentTransition = {
            from: this.weatherStates[this.currentWeather],
            to: this.weatherStates[weatherType]
        };
    }

    update(deltaTime) {
        this.rainSystem.update(deltaTime, this.wind);
        this.windVisual.update(this.wind);
        this.audio.update(this.currentWeather, this.wind.intensity);
        
        if (this.currentTransition) {
            this.transitionProgress += deltaTime / this.transitionDuration;
            
            if (this.transitionProgress >= 1) {
                this.completeTransition();
            } else {
                this.updateTransition();
            }
        }
    }

    updateTransition() {
        const t = this.easeInOutCubic(this.transitionProgress);
        const from = this.currentTransition.from;
        const to = this.currentTransition.to;
        
        this.roadSystem.roadSegments.forEach(segment => {
            segment.material.roughness = from.roughness + (to.roughness - from.roughness) * t;
            segment.material.envMapIntensity = from.reflection + (to.reflection - from.reflection) * t;
            segment.material.needsUpdate = true;
        });
    }

    completeTransition() {
        this.currentWeather = this.transitionTarget;
        this.currentTransition = null;
        this.transitionProgress = 0;
        
        const weather = this.weatherStates[this.currentWeather];
        this.rainSystem.setIntensity(this.currentWeather === 'RAINY' ? 1 : 0);
        this.roadSystem.roadSegments.forEach(segment => {
            segment.material.roughness = weather.roughness;
            segment.material.envMapIntensity = weather.reflection;
            segment.material.needsUpdate = true;
        });
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}