import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ParticleConnections from './ParticleConnections';
import HologramGlobe from './HologramGlobe';

const ThreeBackground = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bc13fe" />

                <ParticleConnections count={150} />
                <HologramGlobe />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;
