import { Map, Compass, Backpack, Scroll } from 'lucide-react'

interface HUDProps {
  onOpenInventory: () => void
  onOpenQuests: () => void
  onOpenMarketplace: () => void
  isConnected: boolean
}

export default function HUD({ onOpenInventory, onOpenQuests, onOpenMarketplace, isConnected }: HUDProps) {
  return (
    <>
      {/* Controls hint — bottom center */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {['W', 'A', 'S', 'D'].map((k) => (
          <div
            key={k}
            style={{
              width: 32,
              height: 32,
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {k}
          </div>
        ))}
        <div
          style={{
            marginLeft: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#94a3b8',
            fontSize: 12,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Compass size={14} color="#94a3b8" />
          Click canvas to look around
        </div>
      </div>

      {/* Action buttons — right side */}
      {isConnected && (
        <div
          style={{
            position: 'fixed',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {[
            { icon: Backpack, label: 'Inventory', onClick: onOpenInventory, color: '#60a5fa' },
            { icon: Map, label: 'Marketplace', onClick: onOpenMarketplace, color: '#4ade80' },
            { icon: Scroll, label: 'Quests', onClick: onOpenQuests, color: '#fbbf24' },
          ].map(({ icon: Icon, label, onClick, color }) => (
            <button
              key={label}
              onClick={onClick}
              title={label}
              style={{
                width: 48,
                height: 48,
                background: 'rgba(0,0,0,0.6)',
                border: `1px solid ${color}44`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: 'pointer',
                color,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget).style.background = 'rgba(0,0,0,0.8)'
                ;(e.currentTarget).style.borderColor = color + '88'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget).style.background = 'rgba(0,0,0,0.6)'
                ;(e.currentTarget).style.borderColor = color + '44'
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 9, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#cbd5e1' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
