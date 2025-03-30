const THREE = window.THREE;

export class RoadSystem {
    constructor(scene) {
        this.scene = scene;
        this.roadSegments = [];
        this.segmentLength = 100;
        this.currentSegment = 0;
        this.texturesLoaded = false;
        this.roadTexture = null;
        this.normalMap = null;
        this.markingTexture = null;
        
        // Road parameters
        this.roadWidth = 8;
        this.roadColor = 0x333333;
        this.markingColor = 0xffffff;
    }

    async loadTextures() {
        try {
            const loader = new THREE.TextureLoader();
            this.roadTexture = await loader.loadAsync('https://example.com/textures/asphalt.jpg');
            this.normalMap = await loader.loadAsync('https://example.com/textures/asphalt_normal.jpg');
            
            // Basic environment map (placeholder)
            this.envMap = new THREE.CubeTextureLoader().load([
                'https://example.com/env/px.jpg', 'https://example.com/env/nx.jpg',
                'https://example.com/env/py.jpg', 'https://example.com/env/ny.jpg',
                'https://example.com/env/pz.jpg', 'https://example.com/env/nz.jpg'
            ]);
            
            this.roadTexture.wrapS = THREE.RepeatWrapping;
            this.roadTexture.wrapT = THREE.RepeatWrapping;
            this.roadTexture.repeat.set(4, 20);
            
            this.normalMap.wrapS = THREE.RepeatWrapping;
            this.normalMap.wrapT = THREE.RepeatWrapping;
            this.normalMap.repeat.set(4, 20);
            
            this.texturesLoaded = true;
        } catch (error) {
            console.error('Failed to load textures:', error);
            this.texturesLoaded = false;
        }
    }

    createSegment(zPosition) {
        const geometry = new THREE.PlaneGeometry(
            this.roadWidth, 
            this.segmentLength
        );
        
        const material = new THREE.MeshStandardMaterial({
            map: this.roadTexture,
            normalMap: this.normalMap,
            normalScale: new THREE.Vector2(0.5, 0.5),
            envMap: this.envMap,
            envMapIntensity: 0.2,
            side: THREE.DoubleSide,
            roughness: 0.8,
            metalness: 0.2,
            refractionRatio: 0.8
        });
        
        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2;
        road.position.z = zPosition;
        road.receiveShadow = true;
        
        this.scene.add(road);
        this.roadSegments.push(road);
        this.createMarkings(road);
    }

    createMarkings(road) {
        const lineMaterial = new THREE.MeshStandardMaterial({
            color: this.markingColor
        });
        
        // Center line
        const lineGeometry = new THREE.PlaneGeometry(0.2, this.segmentLength);
        const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.set(0, 0.01, road.position.z);
        this.scene.add(centerLine);
        
        // Lane markings
        for (let i = -1; i <= 1; i += 2) {
            const laneMarking = new THREE.Mesh(
                new THREE.PlaneGeometry(0.1, 2, 10, 10),
                lineMaterial
            );
            laneMarking.rotation.x = -Math.PI / 2;
            laneMarking.position.set(
                i * this.roadWidth/2, 
                0.01, 
                road.position.z
            );
            this.scene.add(laneMarking);
        }
    }

    update(cameraZ) {
        if (cameraZ > this.roadSegments[0].position.z + this.segmentLength) {
            const segment = this.roadSegments.shift();
            this.scene.remove(segment);
            this.createSegment(
                this.roadSegments[this.roadSegments.length-1].position.z + this.segmentLength
            );
        }
    }
}