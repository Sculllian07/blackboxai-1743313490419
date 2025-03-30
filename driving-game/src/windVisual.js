const THREE = window.THREE;

export class WindVisual {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        
        // Create direction arrow
        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({color: 0x00AAFF});
        this.arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        this.arrow.position.set(0, 0, -5);
        this.group.add(this.arrow);
        
        // Create wind line
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({color: 0x00AAFF});
        this.line = new THREE.Line(lineGeometry, lineMaterial);
        this.group.add(this.line);
        
        scene.add(this.group);
    }

    update(wind) {
        // Update arrow rotation
        this.arrow.rotation.y = Math.atan2(wind.direction.x, wind.direction.z);
        
        // Update line to show wind direction
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(
            wind.direction.x * wind.intensity * 2,
            0,
            wind.direction.z * wind.intensity * 2
        ));
        
        this.line.geometry.setFromPoints(points);
        this.line.geometry.attributes.position.needsUpdate = true;
        
        // Adjust opacity based on intensity
        this.line.material.opacity = 0.3 + wind.intensity * 0.7;
        this.line.material.transparent = true;
    }
}