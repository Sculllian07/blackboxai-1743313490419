const gameConfig = {
    version: "1.0.0",
    physics: {
        gravity: -9.82,
        car: {
            mass: 1500,
            maxSpeed: 120,
            acceleration: 0.2,
            brakePower: 0.5,
            steering: 0.03,
            suspensionStiffness: 30,
            suspensionRestLength: 0.3
        }
    },
    graphics: {
        quality: "high",
        shadows: true,
        antialias: true,
        textureResolution: 2048,
        normalMapIntensity: 0.5,
        envMapIntensity: 0.2,
        wetRoadRoughness: 0.1,
        dryRoadRoughness: 0.8,
        weatherTransitionDuration: 3
    },
    controls: {
        touchSensitivity: 0.8,
        virtualJoystick: true,
        tiltControls: false
    },
    environment: {
        dayNightCycle: true,
        cycleDuration: 300, // 5 minutes realtime = 24h game time
        weatherEffects: {
            rain: true,
            snow: false,
            fog: true
        }
    },
    difficulty: {
        trafficDensity: 0.7,
        pedestrianDensity: 0.3,
        speedLimitTolerance: 0.1 // 10% over speed limit allowed
    }
};

export { gameConfig };
