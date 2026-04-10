import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scene3D() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'low-power',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00d4ff, 2, 15);
        pointLight1.position.set(3, 2, 4);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 15);
        pointLight2.position.set(-3, -2, 4);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xe040fb, 1.5, 15);
        pointLight3.position.set(0, 3, 2);
        scene.add(pointLight3);

        // Floating particles
        const particlesCount = 60;
        const particlesGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i += 3) {
            particlePositions[i] = (Math.random() - 0.5) * 8;
            particlePositions[i + 1] = (Math.random() - 0.5) * 8;
            particlePositions[i + 2] = (Math.random() - 0.5) * 4 - 1;
        }
        particlesGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(particlePositions, 3)
        );
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x00d4ff,
            size: 0.02,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
        });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        // Animation
        let animationId: number;
        let time = 0;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            time += 0.008;

            // Animate particles
            const pPositions = particles.geometry.attributes.position;
            for (let i = 0; i < particlesCount; i++) {
                const y = pPositions.getY(i);
                pPositions.setY(i, y + 0.003);
                if (y > 4) pPositions.setY(i, -4);
            }
            pPositions.needsUpdate = true;

            // Subtle light movement
            pointLight1.position.x = 3 + Math.sin(time) * 1;
            pointLight2.position.y = -2 + Math.cos(time) * 1;
            pointLight3.intensity = 1.5 + Math.sin(time * 2) * 0.5;

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0"
            style={{ pointerEvents: 'none' }}
        />
    );
}
