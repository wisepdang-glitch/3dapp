import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard } from '@react-three/drei'
import { Mesh } from 'three'

interface QuestZoneProps {
  position: [number, number, number]
  questId: number
  label: string
  reward: string
  onEnter: (questId: number) => void
}

export default function QuestZone({ position, questId, label, reward, onEnter }: QuestZoneProps) {
  const meshRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Glowing portal ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.2, 2.5, 32]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#f59e0b'}
          emissive={hovered ? '#f59e0b' : '#d97706'}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Inner glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[2.2, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Spinning orb */}
      <mesh
        ref={meshRef}
        position={[0, 0.7, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => onEnter(questId)}
      >
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={hovered ? '#fef08a' : '#fbbf24'}
          emissive={hovered ? '#fbbf24' : '#f59e0b'}
          emissiveIntensity={hovered ? 1.0 : 0.6}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      {/* Pillar */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.3} />
      </mesh>

      {/* Label billboard */}
      <Billboard follow lockX lockY lockZ={false}>
        <Html
          position={[0, 2.2, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.75)',
              color: '#fbbf24',
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(251,191,36,0.4)',
            }}
          >
            {label}
            <div style={{ color: '#86efac', fontSize: 11, fontWeight: 600 }}>
              +{reward} USDC
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  )
}
