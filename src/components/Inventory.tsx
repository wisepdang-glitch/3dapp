import { X, Sword, Shield, Wand2, Gem } from 'lucide-react'
import type { FC, SVGProps } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { arcTestnet } from 'viem/chains'
import { useState } from 'react'
import { toast } from 'sonner'

interface NFTItem {
  tokenId: number
  name: string
  itemType: string
  rarity: string
  power: number
}

interface InventoryProps {
  onClose: () => void
  contractAddress?: `0x${string}`
  marketplaceAddress?: `0x${string}`
}

const RARITY_COLORS: Record<string, string> = {
  Common: '#9ca3af',
  Uncommon: '#4ade80',
  Rare: '#60a5fa',
  Epic: '#a78bfa',
  Legendary: '#fbbf24',
}

type IconComponent = FC<SVGProps<SVGSVGElement> & { size?: number; color?: string }>

const TYPE_ICONS: Record<string, IconComponent> = {
  Weapon: Sword as IconComponent,
  Armor: Shield as IconComponent,
  Pet: Gem as IconComponent,
  Skin: Wand2 as IconComponent,
}

// ABI fragment for ArcWorldItem
const itemABI = [
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { name: 'tokenOfOwnerByIndex', type: 'function', inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { name: 'getItemAttributes', type: 'function', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'itemType', type: 'uint8' }, { name: 'rarity', type: 'uint8' }, { name: 'power', type: 'uint16' }, { name: 'name', type: 'string' }] }], stateMutability: 'view' },
] as const

// Mock items for demo (shown when no contract deployed yet)
const DEMO_ITEMS: NFTItem[] = [
  { tokenId: 1, name: 'Iron Sword', itemType: 'Weapon', rarity: 'Common', power: 12 },
  { tokenId: 2, name: 'Oak Shield', itemType: 'Armor', rarity: 'Uncommon', power: 8 },
  { tokenId: 3, name: 'Crystal Staff', itemType: 'Weapon', rarity: 'Rare', power: 45 },
]

export default function Inventory({ onClose, contractAddress }: InventoryProps) {
  const { address, isConnected } = useAccount()
  const [listingItem, setListingItem] = useState<NFTItem | null>(null)
  const [price, setPrice] = useState('')

  const { data: balance } = useReadContract(
    contractAddress && address
      ? {
          address: contractAddress,
          abi: itemABI,
          functionName: 'balanceOf',
          args: [address],
          chainId: arcTestnet.id,
        }
      : undefined
  )

  const count = balance ? Number(balance) : 0
  // In a full implementation, we'd read each tokenId and its attributes.
  // For the demo we show mock items when no contract is deployed.
  const items: NFTItem[] = contractAddress ? [] : DEMO_ITEMS

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
          width: 460,
          maxWidth: '94vw',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: '#f9faf3' }}>
            Inventory
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {!isConnected ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
            Connect your wallet to view items
          </div>
        ) : items.length === 0 && count === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
            <Gem size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            No items yet. Explore the world to find items!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {items.map((item) => {
              const Icon = TYPE_ICONS[item.itemType] || Gem
              const color = RARITY_COLORS[item.rarity] || '#9ca3af'
              return (
                <div
                  key={item.tokenId}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${color}33`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: `${color}22`,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: '#f9faf3' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color, fontFamily: 'DM Sans, sans-serif' }}>
                        {item.rarity} {item.itemType}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                      Power: <strong style={{ color: '#f9faf3' }}>{item.power}</strong>
                    </span>
                    <button
                      onClick={() => {
                        if (!contractAddress) {
                          toast.info('Deploy contracts first to list items on marketplace.')
                          return
                        }
                        setListingItem(item)
                      }}
                      style={{
                        background: '#1e3a5f',
                        border: '1px solid #3b82f6',
                        color: '#93c5fd',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      List
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List item modal */}
        {listingItem && (
          <div
            style={{
              marginTop: 20,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, color: '#f9faf3', marginBottom: 12 }}>
              List &ldquo;{listingItem.name}&rdquo; for sale
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Price in USDC"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  color: '#f9faf3',
                  padding: '8px 12px',
                  fontSize: 13,
                  fontFamily: 'Space Grotesk, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  toast.success(`Listed ${listingItem.name} for ${price} USDC!`)
                  setListingItem(null)
                  setPrice('')
                }}
                style={{
                  background: '#122d45',
                  border: '1px solid #3b82f6',
                  color: '#93c5fd',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setListingItem(null)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                  borderRadius: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
