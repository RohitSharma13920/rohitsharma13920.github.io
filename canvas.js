/**
 * ------------------------------------------------------------------
 * CANVAS.JS — Production Cyberpunk 3D WebGL Studio Engine
 * Stack: Three.js (r128) + Custom GLSL Shaders + GSAP
 * Author: Rohit Sharma Flagship Studio
 * ------------------------------------------------------------------
 */

(function () {
    'use strict';

    // 1. SCENE, CAMERA & RENDERER SETUP
    const canvas = document.createElement('canvas');
    canvas.id = 'cyber-webgl-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none'; // DOM buttons aur links block nahi honge
    canvas.style.zIndex = '0';
    document.body.prepend(canvas);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040408, 0.045);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 8.5);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // Mouse Tracking & World Raycast Plane
    const mouse = {
        screenX: 0,
        screenY: 0,
        worldX: 0,
        worldY: 0,
        targetWorldX: 0,
        targetWorldY: 0,
        velocity: 0
    };
    let lastMouseX = 0;
    let lastMouseY = 0;

    const raycaster = new THREE.Raycaster();
    const ndcMouse = new THREE.Vector2(-999, -999);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    // ==============================================================
    // 2. 35,000+ PARTICLES UNIVERSE (CUSTOM GLSL SHADER)
    // ==============================================================
    const particleCount = 35000;
    const particleGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Cyberpunk Color Palette: Neon Cyan, Electric Violet, Deep Crimson
    const palette = [
        new THREE.Color(0x00f2fe), // Neon Cyan
        new THREE.Color(0x9d4edd), // Electric Violet
        new THREE.Color(0xff003c), // Deep Crimson
        new THREE.Color(0xff7b00)  // Molten Amber
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Deep space cylindrical / galaxy distribution
        const radius = 2.5 + Math.random() * 14.0;
        const theta = Math.random() * Math.PI * 2;
        const zSpread = (Math.random() - 0.5) * 16.0;

        positions[i3] = Math.cos(theta) * radius;
        positions[i3 + 1] = (Math.random() - 0.5) * 12.0;
        positions[i3 + 2] = zSpread;

        originalPositions[i3] = positions[i3];
        originalPositions[i3 + 1] = positions[i3 + 1];
        originalPositions[i3 + 2] = positions[i3 + 2];

        // Assign palette colors
        const col = palette[Math.floor(Math.random() * palette.length)];
        colors[i3] = col.r;
        colors[i3 + 1] = col.g;
        colors[i3 + 2] = col.b;

        sizes[i] = 1.0 + Math.random() * 2.6;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Custom Particle Shaders (Buttery 60 FPS GPU Execution)
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector3(0, 0, 0) },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: `
            uniform float uTime;
            uniform vec3 uMouse;
            uniform float uPixelRatio;

            attribute float aSize;
            attribute vec3 color;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vColor = color;
                vec3 pos = position;

                // Cosmic organic floating wave
                pos.x += sin(uTime * 0.45 + position.z * 0.15) * 0.25;
                pos.y += cos(uTime * 0.35 + position.x * 0.18) * 0.25;

                // Gravitational Liquid Warp Field (Mouse Scatter & Dispersion)
                float dist = distance(pos.xy, uMouse.xy);
                float radius = 3.6;

                if (dist < radius) {
                    float force = (1.0 - dist / radius);
                    vec2 dir = normalize(pos.xy - uMouse.xy);
                    pos.xy += dir * force * 2.2;
                    pos.z += sin(uTime * 3.5 + dist * 4.0) * force * 1.8;
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;

                // Perspective depth point size
                gl_PointSize = aSize * uPixelRatio * (26.0 / -mvPosition.z);
                
                // Depth fade
                vAlpha = smoothstep(22.0, 3.0, -mvPosition.z);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // Procedural Soft Glowing Dot
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;

                float glow = exp(-dist * 5.2);
                vec3 finalColor = mix(vColor, vec3(1.0), glow * 0.4);

                gl_FragColor = vec4(finalColor, glow * vAlpha * 0.9);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // ==============================================================
    // 3. INFINITE CYBERPUNK BOTTOM HORIZON GRID
    // ==============================================================
    const gridGeometry = new THREE.PlaneGeometry(60, 60, 60, 60);
    const gridMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0xff003c) }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vElevation;

            void main() {
                vUv = uv;
                vec3 pos = position;
                // Subtle perspective wave
                vElevation = pos.z;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            varying vec2 vUv;

            void main() {
                // Infinite moving grid lines
                vec2 grid = abs(fract(vUv * vec2(30.0, 50.0) - vec2(0.0, uTime * 0.6)) - 0.5) / fwidth(vUv * 30.0);
                float line = min(grid.x, grid.y);
                float intensity = 1.0 - min(line, 1.0);

                // Distance falloff into horizon fog
                float alpha = smoothstep(0.0, 0.7, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
                
                vec3 neonGlow = mix(vec3(0.0, 0.95, 1.0), uColor, vUv.y);
                gl_FragColor = vec4(neonGlow, intensity * alpha * 0.35);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });

    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -3.8;
    scene.add(gridMesh);

    // ==============================================================
    // 4. HOLOGRAPHIC FLOATING 3D CASE STUDY CARDS
    // ==============================================================
    const projectCardsData = [
        { title: 'CineScope AI', tag: 'NLP Sentiment Studio', stat: '91.53% Acc | <14ms', color: '#ff003c', pos: [-3.8, 1.4, -1.2] },
        { title: 'Customer IQ', tag: 'Predictive RFM Engine', stat: 'FastAPI Microservice', color: '#00f2fe', pos: [3.8, 0.8, -1.5] },
        { title: 'Neural Vectorizer', tag: 'TF-IDF 50k Matrix', stat: 'In-Memory Tensors', color: '#ff7b00', pos: [-3.4, -1.8, 0.5] },
        { title: 'Dual AI Council', tag: 'Gemini ✦ & ChatGPT 🟢', stat: 'Telemetry Bridge', color: '#9d4edd', pos: [3.5, -1.5, 0.2] }
    ];

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    const cardMeshes = [];

    // Helper: Generate Procedural Glass Texture
    function createHoloCardTexture(title, tag, stat, borderColor) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 300;
        const ctx = c.getContext('2d');

        // Dark Glass Surface
        ctx.fillStyle = 'rgba(8, 10, 16, 0.85)';
        ctx.fillRect(0, 0, 512, 300);

        // Neon Gradient Border
        ctx.lineWidth = 6;
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(6, 6, 500, 288);

        // Top Accent Pill
        ctx.fillStyle = borderColor;
        ctx.fillRect(36, 36, 12, 12);

        // Subtitle / Tag
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'bold 18px "Fira Code", monospace';
        ctx.fillText(tag.toUpperCase(), 60, 48);

        // Main Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px "Space Grotesk", sans-serif';
        ctx.fillText(title, 36, 120);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(36, 160);
        ctx.lineTo(476, 160);
        ctx.stroke();

        // Metric / Spec Telemetry
        ctx.fillStyle = borderColor;
        ctx.font = 'bold 22px "Fira Code", monospace';
        ctx.fillText(stat, 36, 215);

        // Interactive Footer hint
        ctx.fillStyle = '#71717a';
        ctx.font = '14px "Space Grotesk", sans-serif';
        ctx.fillText('// 3D MAGNETIC HOLOGRAPH', 36, 255);

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    projectCardsData.forEach((data, index) => {
        const tex = createHoloCardTexture(data.title, data.tag, data.stat, data.color);
        const cardGeo = new THREE.PlaneGeometry(2.3, 1.35);
        const cardMat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(cardGeo, cardMat);
        mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
        mesh.userData = {
            originPos: new THREE.Vector3().copy(mesh.position),
            floatOffset: index * 1.5,
            isHovered: false
        };

        cardMeshes.push(mesh);
        cardGroup.add(mesh);
    });

    // ==============================================================
    // 5. MOUSE & WINDOW EVENT LISTENERS
    // ==============================================================
    window.addEventListener('mousemove', (e) => {
        // Normalized device coords
        ndcMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        ndcMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Velocity computation
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        mouse.velocity = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.04, 2.5);
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Unproject 2D mouse to 3D world space at z = 0
        raycaster.setFromCamera(ndcMouse, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, intersectPoint);

        if (intersectPoint) {
            mouse.targetWorldX = intersectPoint.x;
            mouse.targetWorldY = intersectPoint.y;
        }

        // Floating Card Raycast Hover Check
        const intersects = raycaster.intersectObjects(cardMeshes);
        cardMeshes.forEach(mesh => {
            mesh.userData.isHovered = false;
        });

        if (intersects.length > 0) {
            const hitCard = intersects[0].object;
            hitCard.userData.isHovered = true;
            if (window.gsap) {
                gsap.to(hitCard.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.35, ease: 'power2.out' });
            }
        } else {
            cardMeshes.forEach(mesh => {
                if (window.gsap) {
                    gsap.to(mesh.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.45, ease: 'power2.out' });
                }
            });
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });

    // ==============================================================
    // 6. ANIMATION LOOP (ROCK-SOLID 60 FPS)
    // ==============================================================
    const clock = new THREE.Clock();

    function renderLoop() {
        requestAnimationFrame(renderLoop);

        const elapsedTime = clock.getElapsedTime();

        // 1. Smoothly Lerp Mouse Target in 3D Space
        mouse.worldX += (mouse.targetWorldX - mouse.worldX) * 0.085;
        mouse.worldY += (mouse.targetWorldY - mouse.worldY) * 0.085;
        mouse.velocity += (0 - mouse.velocity) * 0.05;

        // Update Shader Uniforms
        particleMaterial.uniforms.uTime.value = elapsedTime;
        particleMaterial.uniforms.uMouse.value.set(mouse.worldX, mouse.worldY, 0);

        gridMaterial.uniforms.uTime.value = elapsedTime;

        // 2. Camera Subtle Inertia / Parallax Tracking
        camera.position.x += (ndcMouse.x * 0.85 - camera.position.x) * 0.035;
        camera.position.y += (1.2 + ndcMouse.y * 0.65 - camera.position.y) * 0.035;
        camera.lookAt(0, 0, 0);

        // 3. Floating 3D Cards Organic Drift & Magnetic Orient
        cardMeshes.forEach(mesh => {
            const timeOffset = elapsedTime * 0.8 + mesh.userData.floatOffset;

            // Idle floating
            mesh.position.y = mesh.userData.originPos.y + Math.sin(timeOffset) * 0.18;
            mesh.position.x = mesh.userData.originPos.x + Math.cos(timeOffset * 0.7) * 0.08;

            if (mesh.userData.isHovered) {
                // Magnetically orient toward the camera
                mesh.rotation.y += (ndcMouse.x * 0.35 - mesh.rotation.y) * 0.12;
                mesh.rotation.x += (-ndcMouse.y * 0.35 - mesh.rotation.x) * 0.12;
            } else {
                mesh.rotation.y += (Math.sin(timeOffset * 0.5) * 0.1 - mesh.rotation.y) * 0.05;
                mesh.rotation.x += (Math.cos(timeOffset * 0.5) * 0.08 - mesh.rotation.x) * 0.05;
            }
        });

        // 4. Subtle Galaxy Rotation
        particleSystem.rotation.y = elapsedTime * 0.015;
        particleSystem.rotation.z = Math.sin(elapsedTime * 0.01) * 0.05;

        renderer.render(scene, camera);
    }

    renderLoop();
    console.log('⚡ [Cyberpunk 3D Engine] Active: 35,000 Shader Particles & Holographic Space Initialized.');
})();