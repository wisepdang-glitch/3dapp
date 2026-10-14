import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Billboard } from '@react-three/drei'
import { Mesh } from 'three'

interface ItemPickupProps {
  position: [number, number, number]
  itemIndex: number
  itemType: string
  rarity: string
  color: string
  picked: boolean
  onPickup: (itemIndex: number) => void
}

const rarityColors: Record<string, string> = {
  Common: '#9ca3af',
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
  Epic: '#a78bfa',
  Legendary: '#fbbf24',
}

export default function ItemPickup({
  position,
  itemIndex,
  itemType,
  rarity,
  color,
  picked,
  onPickup,
}: ItemPickupProps) {
  const meshRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current && !picked) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.2
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + itemIndex) * 0.15
    }
  })

  if (picked) return null

  const rarityColor = rarityColors[rarity] || '#9ca3af'

  return (
    <group position={position}>
      {/* Glow ring on ground */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.35, 0.5, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Item gem */}
      <mesh
        ref={meshRef}
        position={[0, 0.5, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => onPickup(itemIndex)}
      >
        <dodecahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.0 : 0.5}
          metalness={0.6}
          roughness={0.1}
        />
      </mesh>

      {/* Rarity label */}
      <Billboard follow lockX lockY lockZ={false}>
        <Html
          position={[0, 1.2, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.75)',
              color: rarityColor,
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              whiteSpace: 'nowrap',
              border: `1px solid ${rarityColor}66`,
              opacity: hovered ? 1 : 0.85,
            }}
          >
            {itemType}
            <div style={{ color: rarityColor, fontSize: 10, opacity: 0.8 }}>{rarity}</div>
          </div>
        </Html>
      </Billboard>
    </group>
  )
}
