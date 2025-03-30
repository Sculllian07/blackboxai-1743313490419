const THREE = window.THREE;

export class ScreenShake {
    constructor(camera) {
        this.camera = camera;
        this.originalPosition = camera.position.clone();
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
    }

    update(deltaTime) {
        if (this.shakeDuration > 0) {
            // Apply random offset based on intensity
            const intensity = this.shakeIntensity * (this.shakeDuration / 1000);
            this.camera.position.x = this.originalPosition.x + (Math.random() * 2 - 1) * intensity;
            this.camera.position.y = this.originalPosition.y + (Math.random() * 2 - 1) * intensity * 0.3;
            
            this.shakeDuration -= deltaTime * 1000;
        } else {
            // Return to original position
            this.camera.position.copy(this.originalPosition);
        }
    }

    shake(intensity, duration = 500) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
}