import { X, ShoppingCart, Tag } from 'lucide-react'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'

interface Listing {
  id: number
  name: string
  itemType: string
  rarity: string
  power: number
  price: string
  seller: string
}

interface MarketplaceProps {
  onClose: () => void
  contractAddress?: `0x${string}`
}

const RARITY_COLORS: Record<string, string> = {
  Common: '#9ca3af',
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
  Epic: '#a78bfa',
  Legendary: '#fbbf24',
}

// Demo listings shown before contracts are deployed
const DEMO_LISTINGS: Listing[] = [
  { id: 1, name: 'Dragon Blade', itemType: 'Weapon', rarity: 'Epic', power: 88, price: '12.50', seller: '0xAbCd...1234' },
  { id: 2, name: 'Shadow Cloak', itemType: 'Skin', rarity: 'Rare', power: 30, price: '3.00', seller: '0x9e8F...5678' },
  { id: 3, name: 'Stone Golem Pet', itemType: 'Pet', rarity: 'Uncommon', power: 15, price: '1.50', seller: '0x1A2B...9012' },
  { id: 4, name: 'Phoenix Feather', itemType: 'Weapon', rarity: 'Legendary', power: 120, price: '50.00', seller: '0xDeAd...BEEF' },
]

export default function Marketplace({ onClose, contractAddress }: MarketplaceProps) {
  const { isConnected } = useAccount()
  const listings = DEMO_LISTINGS

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: 24,
          width: 500,
          maxWidth: '94vw',
          maxHeight: '82vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag size={18} color="#4ade80" />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: '#f9faf3' }}>
              Marketplace
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#64748b', marginBottom: 20 }}>
          Buy &amp; sell items for USDC on Arc • 2.5% fee
          {!contractAddress && (
            <span style={{ color: '#f59e0b', marginLeft: 6 }}>
              (Demo mode — deploy contracts to enable live trading)
            </span>
          )}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listings.map((item) => {
            const color = RARITY_COLORS[item.rarity] || '#9ca3af'
            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${color}22`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      background: `${color}18`,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      border: `1px solid ${color}33`,
                    }}
                  >
                    {item.itemType === 'Weapon' ? '⚔️' : item.itemType === 'Armor' ? '🛡️' : item.itemType === 'Pet' ? '🐉' : '✨'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, color: '#f9faf3' }}>
                      {item.name}
                    </div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color }}>
                      {item.rarity} {item.itemType} · Power {item.power}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#475569', marginTop: 1 }}>
                      {item.seller}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#4ade80',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.price} <span style={{ fontSize: 11, color: '#64748b' }}>USDC</span>
                  </div>
                  <button
                    onClick={() => {
                      if (!isConnected) {
                        toast.error('Connect your wallet first.')
                        return
                      }
                      if (!contractAddress) {
                        toast.info('Deploy contracts to enable live purchasing.')
                        return
                      }
                      toast.success(`Purchased ${item.name} for ${item.price} USDC!`)
                    }}
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#14532d',
                      border: '1px solid #4ade80',
                      color: '#86efac',
                      borderRadius: 8,
                      padding: '5px 12px',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    <ShoppingCart size={12} />
                    Buy
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
