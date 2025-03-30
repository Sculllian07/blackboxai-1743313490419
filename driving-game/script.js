import { gameConfig } from './config.js';
import { RoadSystem } from './src/road.js';
import { WeatherSystem } from './src/weather.js';
import { ScreenShake } from './src/screenShake.js';

// DOM Elements
const app = document.getElementById('app');

// Three.js Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: gameConfig.graphics.antialias,
    powerPreference: "high-performance",
    alpha: false,
    stencil: false,
    depth: true,
    preserveDrawingBuffer: true // Helps with rendering diagnostics
});

// Add debug logging
console.log('WebGL Renderer created:', {
    width: window.innerWidth,
    height: window.innerHeight,
    capabilities: renderer.capabilities
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = gameConfig.graphics.shadows;
document.getElementById('app').appendChild(renderer.domElement);

// Physics
const world = new CANNON.World();
world.gravity.set(0, gameConfig.physics.gravity, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Game state
const gameState = {
    score: 0,
    time: 0,
    isRunning: false,
    playerCar: null,
    traffic: [],
    roadSystem: null,
    weatherSystem: null
};

// Game Initialization
async function initGame() {
    try {
        console.log('Initializing game systems...');
        
        // Verify scene setup
        if (!scene || !(scene instanceof THREE.Scene)) {
            throw new Error('Three.js scene not properly initialized');
        }
        
        // Add test objects if scene is empty
        if (scene.children.length === 0) {
            console.warn('Scene is empty - adding diagnostic objects');
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.z = -5;
            scene.add(cube);
            
            // Add directional light
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0, 0, 1);
            scene.add(light);
        }
        
        // Initialize road system
        gameState.roadSystem = new RoadSystem(scene);
        gameState.weatherSystem = new WeatherSystem(scene, gameState.roadSystem);
        gameState.weatherSystem.screenShake = new ScreenShake(camera);
        
        console.log('Loading textures...');
        await gameState.roadSystem.loadTextures();
        
        console.log('Game initialized successfully', {
            roadSystem: !!gameState.roadSystem,
            weatherSystem: !!gameState.weatherSystem,
            texturesLoaded: true
        });
        
        // Add basic scene objects if empty
        if (scene.children.length === 0) {
            console.warn('Scene is empty - adding test objects');
            const testGeometry = new THREE.BoxGeometry(1, 1, 1);
            const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const testCube = new THREE.Mesh(testGeometry, testMaterial);
            scene.add(testCube);
            testCube.position.z = -5;
        }
    } catch (e) {
        console.error('Game initialization failed:', e);
        throw e;
    }
    
    // Add virtual controls
    const controlsHTML = `
        <div class="hud">
            <div>SPEED: <span id="speed">0</span> km/h</div>
            <div>TIME: <span id="time">0</span>s</div>
            <div class="weather-controls">
                <button onclick="game.weatherSystem.setWeather('DRY')">Dry</button>
                <button onclick="game.weatherSystem.setWeather('WET')">Wet</button>
                <button onclick="game.weatherSystem.setWeather('RAINY')">Rainy</button>
            </div>
        </div>
    `;
    app.innerHTML += controlsHTML;
}

// Game Loop
function gameLoop() {
    requestAnimationFrame(gameLoop);
    
    // Debug rendering
    if (!gameState.debugShown) {
        console.log('Rendering frame', {
            sceneObjects: scene.children.length,
            rendererInfo: {
                width: renderer.domElement.width,
                height: renderer.domElement.height,
                renderLists: renderer.info.render
            }
        });
        gameState.debugShown = true;
    }
    
    if (gameState.isRunning) {
        const deltaTime = 1/60;
        try {
            world.step(deltaTime);
            gameState.time += deltaTime;
            gameState.weatherSystem.update(deltaTime);
            if (gameState.weatherSystem.screenShake) {
                gameState.weatherSystem.screenShake.update(deltaTime);
            }
            gameState.roadSystem.update(camera.position.z);
            renderer.render(scene, camera);
            
            // Debug output
            if (!gameState.debugShown) {
                console.log('Rendering game scene with:', {
                    objects: scene.children.length,
                    camera: camera.position,
                    renderer: renderer.domElement
                });
                gameState.debugShown = true;
            }
        } catch (e) {
            console.error('Game loop error:', e);
        }
    }
}

// Load Page
async function loadPage(page) {
    try {
        const response = await fetch(`pages/${page}.html`);
        if (!response.ok) throw new Error(`Failed to load ${page}.html (${response.status})`);
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
        if (page === 'game') {
            await initGame();
            // Focus the game container for keyboard input
            document.getElementById('game-container')?.focus();
        }
    } catch (e) {
        console.error('Page load error:', e);
        document.getElementById('app').innerHTML = `
            <div class="error-message p-4 text-center">
                <h2 class="text-2xl font-bold text-red-500 mb-2">Error loading game</h2>
                <p class="text-gray-300 mb-4">${e.message}</p>
                <button onclick="location.reload()" 
                    class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
                    Retry
                </button>
            </div>
        `;
    }
}

// Event Listeners
function setupEventListeners() {
    window.addEventListener('game-start', async () => {
        gameState.isRunning = true;
        await loadPage('game');
    });

    // Direct button click handler as fallback
    document.addEventListener('click', (e) => {
        if (e.target.id === 'start-game') {
            window.dispatchEvent(new CustomEvent('game-start'));
        }
    });
}

// Initialize event listeners
setupEventListeners();

// Export game object for button handlers
window.game = {
    scene,
    camera,
    renderer,
    world,
    gameState,
    weatherSystem: gameState.weatherSystem,
    loadPage,
    startGame: () => {
        gameState.isRunning = true;
        loadPage('game');
    }
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load initial page
loadPage('start');

// Make THREE available globally for modules
window.THREE = THREE;
window.CANNON = CANNON;

// Export for debugging
window.game = {
    scene,
    camera,
    renderer,
    world,
    gameState,
    weatherSystem: gameState.weatherSystem,
    loadPage
};

// Start game loop
gameLoop();
