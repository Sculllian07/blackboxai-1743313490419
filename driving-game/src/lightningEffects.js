export class LightningEffects {
    constructor() {
        this.flashElement = document.createElement('div');
        Object.assign(this.flashElement.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 1000,
            transition: 'opacity 0.1s ease-out'
        });
        document.body.appendChild(this.flashElement);
    }

    flash(intensity) {
        // Random flash pattern
        const flashPattern = [
            { opacity: 0.8 * intensity, duration: 50 },
            { opacity: 0.3 * intensity, duration: 100 },
            { opacity: 0.6 * intensity, duration: 50 }
        ];

        let delay = 0;
        flashPattern.forEach((step, i) => {
            setTimeout(() => {
                this.flashElement.style.opacity = step.opacity;
                if (i === flashPattern.length - 1) {
                    setTimeout(() => {
                        this.flashElement.style.opacity = 0;
                    }, step.duration);
                }
            }, delay);
            delay += step.duration;
        });
    }
}