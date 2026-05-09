import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const HologramGlobe = () => {
    const sphereRef = useRef();

    useFrame((state) => {
        if (sphereRef.current) {
            sphereRef.current.rotation.y += 0.002;
            sphereRef.current.rotation.x += 0.001;
        }
    });

    return (
        <Sphere ref={sphereRef} args={[8, 64, 64]} position={[0, 0, -15]}>
            <MeshDistortMaterial
                color="#050510"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                wireframe={true}
                transparent={true}
                opacity={0.2}
            />
        </Sphere>
    );
};

export default HologramGlobe;
