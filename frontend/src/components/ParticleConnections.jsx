import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleConnections = ({ count = 100 }) => {
    const meshRef = useRef();
    const linesRef = useRef();

    // Generate random positions for particles
    const [positions, connectionLines] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
        }

        const lines = [];
        // Create random line connections between nodes
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dist = Math.sqrt(
                    Math.pow(pos[i * 3] - pos[j * 3], 2) +
                    Math.pow(pos[i * 3 + 1] - pos[j * 3 + 1], 2) +
                    Math.pow(pos[i * 3 + 2] - pos[j * 3 + 2], 2)
                );
                if (dist < 5) {
                    lines.push(
                        pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
                        pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
                    );
                }
            }
        }

        return [pos, new Float32Array(lines)];
    }, [count]);

    useFrame((state) => {
        if (meshRef.current && linesRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
            linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            linesRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group>
            <points ref={meshRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color="#00f3ff"
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={connectionLines.length / 3}
                        array={connectionLines}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#bc13fe" transparent opacity={0.15} />
            </lineSegments>
        </group>
    );
};

export default ParticleConnections;
