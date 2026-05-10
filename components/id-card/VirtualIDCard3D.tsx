'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { IDCardFront } from './IDCardFront'
import { IDCardBack } from './IDCardBack'

interface Card3DProps {
    data: Record<string, unknown>
    rotation: { x: number; y: number }
}

function Card3DMesh({ data, rotation }: Card3DProps) {
    const meshRef = useRef<THREE.Group>(null)
    const [showBack, setShowBack] = useState(false)

    useFrame(() => {
        if (meshRef.current) {
            // Smooth lerp to target rotation
            meshRef.current.rotation.y = THREE.MathUtils.lerp(
                meshRef.current.rotation.y,
                rotation.y,
                0.08
            )
            meshRef.current.rotation.x = THREE.MathUtils.lerp(
                meshRef.current.rotation.x,
                rotation.x,
                0.08
            )

            // Determine if we should show back based on Y rotation
            const normalizedY = ((meshRef.current.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
            setShowBack(normalizedY > Math.PI / 2 && normalizedY < Math.PI * 1.5)
        }
    })

    return (
        <group ref={meshRef}>
            {/* Card Body */}
            <RoundedBox args={[3.6, 5.2, 0.06]} radius={0.12} smoothness={4}>
                <meshPhysicalMaterial
                    color="#1a1a1a"
                    metalness={0.7}
                    roughness={0.25}
                    clearcoat={0.8}
                    clearcoatRoughness={0.1}
                />
            </RoundedBox>

            {/* Red Accent Lines */}
            <mesh position={[0, 2.58, 0.035]}>
                <planeGeometry args={[3.56, 0.06]} />
                <meshBasicMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0, -2.58, 0.035]}>
                <planeGeometry args={[3.56, 0.04]} />
                <meshBasicMaterial color="#dc2626" />
            </mesh>

            {/* Academy Name (Front) */}
            <Text
                position={[-1.1, 2.2, 0.04]}
                fontSize={0.22}
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
                font="/fonts/Inter-Bold.woff"
                maxWidth={2.5}
            >
                ROPE PRO
            </Text>
            <Text
                position={[-1.1, 1.95, 0.04]}
                fontSize={0.1}
                color="#dc2626"
                anchorX="left"
                anchorY="middle"
                letterSpacing={0.15}
            >
                ACADEMY
            </Text>

            {/* Photo Circle (Front) */}
            <mesh position={[0, 0.8, 0.04]}>
                <circleGeometry args={[0.6, 64]} />
                <meshBasicMaterial color="#300a0a" />
            </mesh>
            <mesh position={[0, 0.8, 0.045]}>
                <ringGeometry args={[0.58, 0.63, 64]} />
                <meshBasicMaterial color="#dc2626" transparent opacity={0.5} />
            </mesh>

            {/* Name Text (Front) */}
            <Text
                position={[0, -0.1, 0.04]}
                fontSize={0.18}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={3.2}
            >
                {(data.full_name as string || 'STUDENT NAME').toUpperCase()}
            </Text>

            {/* Student ID (Front) */}
            <Text
                position={[0, -0.4, 0.04]}
                fontSize={0.12}
                color="#dc2626"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.08}
            >
                {data.student_id as string || 'RPA-0000-0001'}
            </Text>

            {/* Holographic Effect Overlay */}
            <mesh position={[0, 0, 0.035]} rotation={[0, 0, Math.PI / 12]}>
                <planeGeometry args={[3.5, 5.1]} />
                <meshPhysicalMaterial
                    color="#dc2626"
                    transparent
                    opacity={0.04}
                    metalness={1}
                    roughness={0}
                    iridescence={1}
                    iridescenceIOR={2.2}
                />
            </mesh>

            {/* Back Side - VERIFICATION Text */}
            <Text
                position={[0, 2.2, -0.04]}
                fontSize={0.1}
                color="#dc2626"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.2}
                rotation={[0, Math.PI, 0]}
            >
                VERIFICATION
            </Text>

            {/* Back Side - QR placeholder */}
            <mesh position={[0, 0.6, -0.04]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[1.2, 1.2]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Back Side - Barcode placeholder */}
            <mesh position={[0, -0.6, -0.04]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[2.2, 0.5]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Back Side Info Labels */}
            <Text
                position={[0, -0.05, -0.04]}
                fontSize={0.08}
                color="#666666"
                anchorX="center"
                anchorY="middle"
                rotation={[0, Math.PI, 0]}
                letterSpacing={0.15}
            >
                SCAN TO VERIFY IDENTITY
            </Text>

            <Text
                position={[0, -1.3, -0.04]}
                fontSize={0.08}
                color="#666666"
                anchorX="center"
                anchorY="middle"
                rotation={[0, Math.PI, 0]}
                letterSpacing={0.1}
            >
                {`SERIAL: ${(data.card_serial_number as string) || 'GENERATING...'}`}
            </Text>
        </group>
    )
}

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[3.6, 5.2, 0.06]} />
            <meshBasicMaterial color="#1a1a1a" />
        </mesh>
    )
}

interface VirtualIDCard3DProps {
    data: Record<string, unknown>
}

export function VirtualIDCard3D({ data }: VirtualIDCard3DProps) {
    const [rotation, setRotation] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const lastPos = useRef({ x: 0, y: 0 })

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        lastPos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const deltaX = (e.clientX - lastPos.current.x) * 0.01
            const deltaY = (e.clientY - lastPos.current.y) * 0.01
            setRotation((prev) => ({
                x: Math.max(-0.5, Math.min(0.5, prev.x - deltaY)),
                y: prev.y + deltaX,
            }))
            lastPos.current = { x: e.clientX, y: e.clientY }
        } else {
            // Subtle hover effect
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            const x = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3
            const y = ((e.clientX - rect.left) / rect.width - 0.5) * 0.3
            setRotation({ x, y })
        }
    }

    const handleMouseUp = () => setIsDragging(false)
    const handleMouseLeave = () => {
        setIsDragging(false)
        setRotation({ x: 0, y: 0 })
    }

    return (
        <div
            className="w-full h-[600px] cursor-grab active:cursor-grabbing rounded-xl"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <Canvas
                camera={{ position: [0, 0, 7], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.6} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} />
                <pointLight position={[-10, -5, 5]} intensity={0.5} color="#dc2626" />
                <pointLight position={[5, 5, -5]} intensity={0.3} color="#ffffff" />

                <Suspense fallback={<LoadingFallback />}>
                    <Card3DMesh data={data} rotation={rotation} />
                </Suspense>
            </Canvas>

            <p className="text-center text-sm text-gray-400 mt-2">
                ✨ Click & drag to rotate • Hover for 3D effect
            </p>
        </div>
    )
}
