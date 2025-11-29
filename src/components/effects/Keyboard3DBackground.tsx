"use client"

import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { Environment, PerspectiveCamera, ContactShadows, Text } from "@react-three/drei"
import { Suspense, useState, useEffect, useRef, useCallback } from "react"
import * as THREE from "three"

// Types
interface KeyData {
  label: string
  code: string
  width?: number
  color?: string
  textColor?: string
  fontSize?: number
  align?: "left" | "center" | "right"
}

// Keyboard layout
const KEYBOARD_LAYOUT: KeyData[][] = [
  [
    { label: "Esc", code: "Escape", color: "#ef4444", textColor: "white", fontSize: 0.18, align: "left" },
    { label: "1", code: "Digit1" },
    { label: "2", code: "Digit2" },
    { label: "3", code: "Digit3" },
    { label: "4", code: "Digit4" },
    { label: "5", code: "Digit5" },
    { label: "6", code: "Digit6" },
    { label: "7", code: "Digit7" },
    { label: "8", code: "Digit8" },
    { label: "9", code: "Digit9" },
    { label: "0", code: "Digit0" },
    { label: "-", code: "Minus" },
    { label: "=", code: "Equal" },
    { label: "Bksp", code: "Backspace", width: 2, color: "#0066ff", textColor: "white", fontSize: 0.2, align: "right" },
  ],
  [
    { label: "Tab", code: "Tab", width: 1.5, fontSize: 0.2, align: "left" },
    { label: "Q", code: "KeyQ" },
    { label: "W", code: "KeyW" },
    { label: "E", code: "KeyE" },
    { label: "R", code: "KeyR" },
    { label: "T", code: "KeyT" },
    { label: "Y", code: "KeyY" },
    { label: "U", code: "KeyU" },
    { label: "I", code: "KeyI" },
    { label: "O", code: "KeyO" },
    { label: "P", code: "KeyP" },
    { label: "[", code: "BracketLeft" },
    { label: "]", code: "BracketRight" },
    { label: "\\", code: "Backslash", width: 1.5 },
  ],
  [
    { label: "Caps", code: "CapsLock", width: 1.8, fontSize: 0.2, align: "left" },
    { label: "A", code: "KeyA" },
    { label: "S", code: "KeyS" },
    { label: "D", code: "KeyD" },
    { label: "F", code: "KeyF" },
    { label: "G", code: "KeyG" },
    { label: "H", code: "KeyH" },
    { label: "J", code: "KeyJ" },
    { label: "K", code: "KeyK" },
    { label: "L", code: "KeyL" },
    { label: ";", code: "Semicolon" },
    { label: "'", code: "Quote" },
    { label: "Enter", code: "Enter", width: 2.2, color: "#0066ff", textColor: "white", fontSize: 0.2, align: "right" },
  ],
  [
    { label: "Shift", code: "ShiftLeft", width: 2.3, color: "#27272a", textColor: "white", fontSize: 0.2, align: "left" },
    { label: "Z", code: "KeyZ" },
    { label: "X", code: "KeyX" },
    { label: "C", code: "KeyC" },
    { label: "V", code: "KeyV" },
    { label: "B", code: "KeyB" },
    { label: "N", code: "KeyN" },
    { label: "M", code: "KeyM" },
    { label: ",", code: "Comma" },
    { label: ".", code: "Period" },
    { label: "/", code: "Slash" },
    { label: "Shift", code: "ShiftRight", width: 2.7, color: "#27272a", textColor: "white", fontSize: 0.2, align: "right" },
  ],
  [
    { label: "Ctrl", code: "ControlLeft", width: 1.5, fontSize: 0.2, color: "#18181b" },
    { label: "Win", code: "MetaLeft", width: 1.2, fontSize: 0.2, color: "#18181b" },
    { label: "Alt", code: "AltLeft", width: 1.2, fontSize: 0.2, color: "#18181b" },
    { label: "", code: "Space", width: 6.5 },
    { label: "Alt", code: "AltRight", width: 1.2, fontSize: 0.2, color: "#18181b" },
    { label: "Fn", code: "Fn", width: 1.2, fontSize: 0.2, color: "#18181b" },
    { label: "Ctrl", code: "ControlRight", width: 1.5, fontSize: 0.2, color: "#18181b" },
  ],
]

// Key component
function Key({ data, position, isPressed, onPress }: {
  data: KeyData
  position: [number, number, number]
  isPressed: boolean
  onPress: () => void
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const targetY = isPressed ? -0.15 : 0

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.5)
    }
  })

  const width = data.width || 1
  const height = 0.5
  const baseColor = data.color || "#f4f4f5"
  const activeColor = "#e4e4e7"
  const hoverColor = "#fafafa"
  const materialColor = isPressed ? activeColor : hovered ? hoverColor : baseColor
  const textColor = data.textColor || "#18181b"

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={(e) => {
        e.stopPropagation()
        onPress()
      }}
    >
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width * 0.92, height, 0.92]} />
        <meshStandardMaterial color={materialColor} roughness={0.4} metalness={0.1} />
      </mesh>
      <Text
        position={[
          data.align === "left" ? -width / 2 + 0.3 : data.align === "right" ? width / 2 - 0.3 : 0,
          height + 0.01,
          data.align === "left" || data.align === "right" ? 0 : 0.1,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={data.fontSize || 0.25}
        color={textColor}
        anchorX={data.align || "center"}
        anchorY="middle"
      >
        {data.label}
      </Text>
    </group>
  )
}

// Keyboard 3D model
function Keyboard3D({ activeKeys }: { activeKeys: Set<string> }) {
  const handleKeyPress = useCallback((keyData: KeyData) => {
    const keyVal = keyData.code === "Space" ? " " : keyData.label
    const event = new KeyboardEvent("keydown", { key: keyVal, code: keyData.code })
    window.dispatchEvent(event)
    setTimeout(() => {
      const upEvent = new KeyboardEvent("keyup", { key: keyVal, code: keyData.code })
      window.dispatchEvent(upEvent)
    }, 100)
  }, [])

  return (
    <group position={[0, -1, 0]} rotation={[0.1, 0, 0]}>
      {/* Keyboard Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[16, 1, 6.5]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Border */}
      <mesh position={[0, 0.1, -3.3]} receiveShadow>
        <boxGeometry args={[16.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 3.3]} receiveShadow>
        <boxGeometry args={[16.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      <mesh position={[-8.1, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.2, 1.2, 6.8]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      <mesh position={[8.1, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.2, 1.2, 6.8]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>

      {/* LED strip glow */}
      <mesh position={[0, 0.05, -3.4]}>
        <boxGeometry args={[15, 0.1, 0.1]} />
        <meshBasicMaterial color="#0066ff" />
      </mesh>

      {/* Keys */}
      <group position={[-7.5, 0.5, -2.5]}>
        {KEYBOARD_LAYOUT.map((row, rowIndex) => {
          let currentX = 0
          return (
            <group key={rowIndex} position={[0, 0, rowIndex * 1.1]}>
              {row.map((keyData) => {
                const xPos = currentX + (keyData.width || 1) / 2 - 0.5
                currentX += (keyData.width || 1) + 0.1
                const isPressed = activeKeys.has(keyData.code)

                return (
                  <Key
                    key={keyData.code}
                    data={keyData}
                    position={[xPos, 0, 0]}
                    isPressed={isPressed}
                    onPress={() => handleKeyPress(keyData)}
                  />
                )
              })}
            </group>
          )
        })}
      </group>
    </group>
  )
}

// Responsive camera
function ResponsiveCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = size.width / size.height
    const isMobile = size.width < 768
    let zPos = 14
    let yPos = 10

    if (isMobile) {
      const targetWidth = 20
      const vFov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180
      const dist = targetWidth / (2 * Math.tan(vFov / 2) * aspect)
      zPos = Math.max(dist, 18)
      yPos = zPos * 0.6
    }

    camera.position.set(0, yPos, zPos)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}

// Floating animation for the keyboard
function FloatingKeyboard({ activeKeys }: { activeKeys: Set<string> }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Keyboard3D activeKeys={activeKeys} />
    </group>
  )
}

// Main background component
export default function Keyboard3DBackground() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys((prev) => new Set(prev).add(e.code))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev)
        next.delete(e.code)
        return next
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ pointerEvents: 'auto' }}
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 10, 14]} fov={45} />
        <ResponsiveCamera />

        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 15, 35]} />

        <ambientLight intensity={0.3} />
        <spotLight
          position={[10, 15, 10]}
          angle={0.2}
          penumbra={1}
          intensity={1.5}
          castShadow
          color="#ffffff"
        />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#0066ff" />
        <pointLight position={[10, 5, -10]} intensity={0.3} color="#0066ff" />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <FloatingKeyboard activeKeys={activeKeys} />
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.6}
            scale={30}
            blur={2.5}
            far={4}
            color="#0066ff"
          />
        </Suspense>
      </Canvas>

      {/* Instruction text */}
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
        <p className="text-white/30 text-sm font-mono">
          ⌨️ Skriv på ditt tangentbord eller klicka på 3D-tangenterna
        </p>
      </div>
    </div>
  )
}

