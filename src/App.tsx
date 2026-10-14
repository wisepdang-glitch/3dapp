import { Suspense, useState } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import World from './game/World'
import WalletBar from './components/WalletBar'
import HUD from './components/HUD'
import Inventory from './components/Inventory'
import Marketplace from './components/Marketplace'
import QuestBoard from './components/QuestBoard'

// Deployed contract addresses on Arc Testnet
const ITEM_CONTRACT: `0x${string}` = '0x9a48eb87c549cf227051f77493204480bd2ce6b0'
const MARKETPLACE_CONTRACT: `0x${string}` = '0xd493f75cb1604e38168bbd920968f6cf50e6df18'
const QUEST_CONTRACT: `0x${string}` = '0xd08994d874c4fca66beb9096fea70e04cbaeea37'

type Modal = 'inventory' | 'marketplace' | 'quests' | null

const ITEM_NAMES = ['Ancient Sword', 'Storm Shield', 'Arcane Staff', 'Moonstone Pendant']
const ITEM_TYPES = ['Weapon', 'Armor', 'Weapon', 'Pet'] as const
const ITEM_RARITIES = ['Rare', 'Uncommon', 'Epic', 'Legendary'] as const

export default function App() {
  const { isConnected } = useAccount()
  const [modal, setModal] = useState<Modal>(null)
  const [pickedItems, setPickedItems] = useState<Set<number>>(new Set())
  const [completedQuests, setCompletedQuests] = useState<Set<number>>(new Set())

  const handlePickupItem = (itemIndex: number) => {
    if (!isConnected) {
      toast.error('Connect your wallet to pick up items!')
      return
    }
    if (pickedItems.has(itemIndex)) return

    const name = ITEM_NAMES[itemIndex]
    const rarity = ITEM_RARITIES[itemIndex]
    const type = ITEM_TYPES[itemIndex]

    toast.success(
      `Found ${name}!`,
      {
        description: `${rarity} ${type} — minting as NFT on Arc…`,
        duration: 4000,
      }
    )

    setPickedItems((prev) => new Set([...prev, itemIndex]))

    // If contract deployed, would call mintToPlayer here
    if (!ITEM_CONTRACT) {
      setTimeout(() => {
        toast.info(`${name} added to your inventory! (Demo: deploy contracts to mint on-chain)`)
      }, 1500)
    }
  }

  const handleEnterQuestZone = (questId: number) => {
    if (!isConnected) {
      toast.error('Connect your wallet to complete quests!')
      return
    }
    if (completedQuests.has(questId)) {
      toast.info('You already completed this quest.')
      return
    }

    const questNames: Record<number, string> = {
      1: 'The Lost Rune',
      2: 'Mountain Trial',
    }
    const questRewards: Record<number, string> = {
      1: '5.00',
      2: '10.00',
    }

    toast.success(`Quest zone entered: ${questNames[questId]}`, {
      description: QUEST_CONTRACT
        ? 'Claiming reward on Arc…'
        : `+${questRewards[questId]} USDC reward (Demo: deploy contracts to claim on-chain)`,
      duration: 4000,
    })

    setCompletedQuests((prev) => new Set([...prev, questId]))
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: '#0d1b2f' }}>
      {/* 3D World — full screen */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94a3b8',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 16,
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: '3px solid rgba(255,255,255,0.1)',
                  borderTopColor: '#fbbf24',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Loading Arc World…
            </div>
          }
        >
          <World
            onPickupItem={handlePickupItem}
            onEnterQuestZone={handleEnterQuestZone}
            pickedItems={pickedItems}
          />
        </Suspense>
      </div>

      {/* Overlaid UI */}
      <WalletBar />
      <HUD
        onOpenInventory={() => setModal('inventory')}
        onOpenQuests={() => setModal('quests')}
        onOpenMarketplace={() => setModal('marketplace')}
        isConnected={isConnected}
      />

      {/* Welcome screen for first-time visitors */}
      {!isConnected && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 16,
            padding: '14px 24px',
            textAlign: 'center',
            maxWidth: 340,
            width: '90vw',
          }}
        >
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              color: '#fbbf24',
              marginBottom: 4,
            }}
          >
            Welcome to Arc World
          </div>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 13,
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Connect your wallet to explore, collect NFT items, complete quests, and earn USDC on Arc.
          </p>
        </div>
      )}

      {/* Modals */}
      {modal === 'inventory' && (
        <Inventory
          onClose={() => setModal(null)}
          contractAddress={ITEM_CONTRACT}
          marketplaceAddress={MARKETPLACE_CONTRACT}
        />
      )}
      {modal === 'marketplace' && (
        <Marketplace
          onClose={() => setModal(null)}
          contractAddress={MARKETPLACE_CONTRACT}
        />
      )}
      {modal === 'quests' && (
        <QuestBoard
          onClose={() => setModal(null)}
          contractAddress={QUEST_CONTRACT}
          completedQuestIds={completedQuests}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
