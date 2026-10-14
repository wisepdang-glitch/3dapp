import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Euler, Group } from 'three'

const SPEED = 6
const keys: Record<string, boolean> = {}

export default function Player() {
  const groupRef = useRef<Group>(null!)
  const { camera } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(-0.3)
  const isPointerLocked = useRef(false)
  const position = useRef(new Vector3(0, 0, 0))

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys[e.code] = true }
    const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false }

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return
      yaw.current -= e.movementX * 0.002
      pitch.current -= e.movementY * 0.002
      pitch.current = Math.max(-0.8, Math.min(0.4, pitch.current))
    }

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null
    }

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'CANVAS') {
        void document.body.requestPointerLock()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      window.removeEventListener('click', onClick)
    }
  }, [])

  useFrame((_, delta) => {
    const forward = new Vector3(
      -Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current)
    )
    const right = new Vector3(
      Math.cos(yaw.current),
      0,
      -Math.sin(yaw.current)
    )

    const move = new Vector3()
    if (keys['KeyW'] || keys['ArrowUp']) move.add(forward)
    if (keys['KeyS'] || keys['ArrowDown']) move.sub(forward)
    if (keys['KeyA'] || keys['ArrowLeft']) move.sub(right)
    if (keys['KeyD'] || keys['ArrowRight']) move.add(right)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(SPEED * delta)
      position.current.add(move)
    }

    // Clamp to world bounds
    position.current.x = Math.max(-90, Math.min(90, position.current.x))
    position.current.z = Math.max(-90, Math.min(90, position.current.z))
    position.current.y = 0

    if (groupRef.current) {
      groupRef.current.position.copy(position.current)
      groupRef.current.rotation.y = yaw.current
    }

    // Camera follows player
    const cameraOffset = new Vector3(0, 1.8, 0)
    const cameraPos = position.current.clone().add(cameraOffset)

    const euler = new Euler(pitch.current, yaw.current, 0, 'YXZ')
    const cameraDir = new Vector3(0, 0, -3).applyEuler(euler)
    camera.position.copy(cameraPos).sub(cameraDir)
    camera.lookAt(cameraPos)
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.9, 4, 8]} />
        <meshStandardMaterial color="#3a6ea8" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#f5d08a" roughness={0.5} />
      </mesh>
    </group>
  )
}
