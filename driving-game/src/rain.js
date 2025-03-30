const THREE = window.THREE;

export class RainSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleCount = 2000;
        this.particles = new THREE.BufferGeometry();
        this.rainMaterial = new THREE.PointsMaterial({
            color: 0xAAAAFF,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        // Initialize particle positions
        const positions = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = Math.random() * 100 - 50;
            positions[i * 3 + 1] = Math.random() * 50 + 20;
            positions[i * 3 + 2] = Math.random() * 100 - 50;
            sizes[i] = 0.1 + Math.random() * 0.2;
        }

        this.particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        this.rain = new THREE.Points(this.particles, this.rainMaterial);
        this.scene.add(this.rain);
        this.intensity = 0;
    }

    update(deltaTime, wind) {
        const positions = this.particles.attributes.position.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] += wind.direction.x * wind.intensity * 0.1;
            positions[i * 3 + 1] -= 0.5 * this.intensity;
            positions[i * 3 + 2] += wind.direction.z * wind.intensity * 0.1;
            
            if (positions[i * 3 + 1] < -10) {
                positions[i * 3] = Math.random() * 100 - 50;
                positions[i * 3 + 1] = Math.random() * 20 + 30;
                positions[i * 3 + 2] = Math.random() * 100 - 50;
            }
        }
        
        this.particles.attributes.position.needsUpdate = true;
    }

    setIntensity(intensity) {
        this.intensity = intensity;
        this.rainMaterial.opacity = 0.2 + intensity * 0.6;
    }
}