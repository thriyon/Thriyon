"use client";

import { useEffect, useRef, useState, Component, ErrorInfo, ReactNode, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Canvas Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Orb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.1;
    ref.current.rotation.x = Math.sin(t * 0.15) * 0.2;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.6, 64]} />
        <MeshDistortMaterial
          color="#1a0d2e"
          roughness={0.05}
          metalness={1}
          distort={0.45}
          speed={1.4}
          envMapIntensity={1.3}
        />
      </mesh>
    </Float>
  );
}

function Ring({ radius = 2.4, tilt = 0 }: { radius?: number; tilt?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.12;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.005, 16, 200]} />
      <meshBasicMaterial color="#b39dff" transparent opacity={0.35} />
    </mesh>
  );
}

export function HeroSphere({ onReady }: { onReady?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Delay Canvas by 1.5s so the loading screen letter animation plays
    // smoothly before WebGL shader compilation blocks the main thread.
    // The loader minimum time is 2.5s so there's still 1s for shaders to compile.
    const timer = setTimeout(() => setMounted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-10"
      >
        <ErrorBoundary fallback={null}>
          <div className="relative w-full h-full">
            <Canvas
              className="absolute inset-0"
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              onCreated={() => {
                setLoaded(true);
                onReady?.();
              }}
            >
              <Suspense fallback={null}>
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} color="#b39dff" />
                <directionalLight position={[-5, -3, 2]} intensity={0.8} color="#4a3aff" />
                <Orb />
                <Ring radius={2.3} tilt={0.1} />
                <Ring radius={2.7} tilt={-0.15} />
                <Ring radius={3.1} tilt={0.05} />
                <Environment preset="night" />
              </Suspense>
            </Canvas>
          </div>
        </ErrorBoundary>
      </motion.div>
    </div>
  );
}
