import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Environment, Stars } from '@react-three/drei'
import Player from './Player'
import QuestZone from './QuestZone'
import ItemPickup from './ItemPickup'

interface WorldProps {
  onPickupItem: (itemIndex: number) => void
  onEnterQuestZone: (questId: number) => void
  pickedItems: Set<number>
}

function Terrain() {
  return (
    <>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#5a8a4a" roughness={1} />
      </mesh>

      {/* Grass patches */}
      {[
        [15, 0, 10],
        [-20, 0, 5],
        [5, 0, -18],
        [-10, 0, -8],
        [25, 0, -15],
      ].map(([x, , z], i) => (
        <mesh key={i} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#4a7a3a" roughness={1} />
        </mesh>
      ))}

      {/* Trees */}
      {[
        [12, 0, -5],
        [-15, 0, 12],
        [8, 0, 18],
        [-22, 0, -8],
        [20, 0, 8],
        [-8, 0, -20],
        [18, 0, -20],
        [-18, 0, 20],
      ].map(([x, , z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* trunk */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 2.4, 8]} />
            <meshStandardMaterial color="#6b4226" roughness={0.9} />
          </mesh>
          {/* foliage */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <coneGeometry args={[2, 3, 8]} />
            <meshStandardMaterial color="#2d6a2d" roughness={0.8} />
          </mesh>
          <mesh position={[0, 4.8, 0]} castShadow>
            <coneGeometry args={[1.4, 2.4, 8]} />
            <meshStandardMaterial color="#358035" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Rocks */}
      {[
        [6, 0, 8, 0.8],
        [-5, 0, 12, 0.6],
        [14, 0, -12, 1],
        [-12, 0, 6, 0.7],
      ].map(([x, , z, s], i) => (
        <mesh key={i} position={[x, s * 0.3, z]} castShadow>
          <dodecahedronGeometry args={[s, 0]} />
          <meshStandardMaterial color="#888" roughness={1} />
        </mesh>
      ))}

      {/* Path */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 40]} />
        <meshStandardMaterial color="#c4a882" roughness={1} />
      </mesh>
    </>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 80, 30]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <hemisphereLight args={['#87ceeb', '#4a7a3a', 0.3]} />
    </>
  )
}

export default function World({ onPickupItem, onEnterQuestZone, pickedItems }: WorldProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ fov: 70, near: 0.1, far: 500 }}
        style={{ background: '#87ceeb' }}
      >
        <Sky sunPosition={[100, 80, 100]} turbidity={0.3} rayleigh={0.5} />
        <Stars radius={150} depth={50} count={1000} factor={2} fade />
        <Environment preset="park" />
        <Lighting />
        <Terrain />

        <Player />

        {/* Quest zones */}
        <QuestZone
          position={[-6, 0, -6]}
          questId={1}
          label="The Lost Rune"
          reward="5.00"
          onEnter={onEnterQuestZone}
        />
        <QuestZone
          position={[10, 0, 15]}
          questId={2}
          label="Mountain Trial"
          reward="10.00"
          onEnter={onEnterQuestZone}
        />

        {/* Item pickups in the world */}
        <ItemPickup
          position={[3, 0, 5]}
          itemIndex={0}
          itemType="Sword"
          rarity="Rare"
          color="#4fc3f7"
          picked={pickedItems.has(0)}
          onPickup={onPickupItem}
        />
        <ItemPickup
          position={[-4, 0, 9]}
          itemIndex={1}
          itemType="Shield"
          rarity="Uncommon"
          color="#81c784"
          picked={pickedItems.has(1)}
          onPickup={onPickupItem}
        />
        <ItemPickup
          position={[8, 0, -3]}
          itemIndex={2}
          itemType="Staff"
          rarity="Epic"
          color="#ce93d8"
          picked={pickedItems.has(2)}
          onPickup={onPickupItem}
        />
        <ItemPickup
          position={[-7, 0, -10]}
          itemIndex={3}
          itemType="Pendant"
          rarity="Legendary"
          color="#ffd54f"
          picked={pickedItems.has(3)}
          onPickup={onPickupItem}
        />
      </Canvas>
    </div>
  )
}
