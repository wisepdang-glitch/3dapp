import { X, Scroll, MapPin, Trophy } from 'lucide-react'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'

interface Quest {
  id: number
  title: string
  description: string
  reward: string
  location: string
  active: boolean
  completed: boolean
}

interface QuestBoardProps {
  onClose: () => void
  contractAddress?: `0x${string}`
  completedQuestIds: Set<number>
}

const DEMO_QUESTS: Quest[] = [
  {
    id: 1,
    title: 'The Lost Rune',
    description: 'Venture to the ancient stone near the forest edge and retrieve the rune fragment.',
    reward: '5.00',
    location: 'South Forest (-6, -6)',
    active: true,
    completed: false,
  },
  {
    id: 2,
    title: 'Mountain Trial',
    description: 'Prove your worth by reaching the northern shrine at the edge of the known world.',
    reward: '10.00',
    location: 'North Ridge (10, 15)',
    active: true,
    completed: false,
  },
  {
    id: 3,
    title: 'Merchant Run',
    description: 'Deliver a package to the marketplace by sundown. Time is of the essence.',
    reward: '2.50',
    location: 'Town Center (0, 0)',
    active: false,
    completed: false,
  },
]

export default function QuestBoard({ onClose, contractAddress, completedQuestIds }: QuestBoardProps) {
  const { isConnected } = useAccount()

  const quests = DEMO_QUESTS.map((q) => ({
    ...q,
    completed: completedQuestIds.has(q.id),
  }))

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
          width: 480,
          maxWidth: '94vw',
          maxHeight: '82vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scroll size={18} color="#fbbf24" />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: '#f9faf3' }}>
              Quest Board
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#64748b', marginBottom: 20 }}>
          Complete quests to earn USDC on Arc
          {!contractAddress && (
            <span style={{ color: '#f59e0b', marginLeft: 6 }}>
              (Demo — deploy contracts for live rewards)
            </span>
          )}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quests.map((quest) => (
            <div
              key={quest.id}
              style={{
                background: quest.completed
                  ? 'rgba(20,83,45,0.3)'
                  : quest.active
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${quest.completed ? '#4ade8044' : quest.active ? '#fbbf2433' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12,
                padding: '14px 16px',
                opacity: quest.active || quest.completed ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {quest.completed ? (
                    <Trophy size={16} color="#4ade80" />
                  ) : (
                    <MapPin size={16} color={quest.active ? '#fbbf24' : '#475569'} />
                  )}
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 600,
                      fontSize: 15,
                      color: quest.completed ? '#4ade80' : '#f9faf3',
                    }}
                  >
                    {quest.title}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#4ade80',
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                  }}
                >
                  {quest.reward} <span style={{ fontSize: 10, color: '#64748b' }}>USDC</span>
                </div>
              </div>

              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 12,
                  color: '#94a3b8',
                  margin: '0 0 8px',
                  lineHeight: 1.5,
                }}
              >
                {quest.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#475569' }}>
                  {quest.location}
                </span>
                {quest.completed ? (
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#4ade80', fontWeight: 600 }}>
                    Completed
                  </span>
                ) : quest.active ? (
                  <button
                    onClick={() => {
                      if (!isConnected) {
                        toast.error('Connect your wallet first.')
                        return
                      }
                      toast.info(`Head to ${quest.location} to complete this quest!`)
                    }}
                    style={{
                      background: '#422006',
                      border: '1px solid #f59e0b',
                      color: '#fbbf24',
                      borderRadius: 8,
                      padding: '4px 12px',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    Go to Quest
                  </button>
                ) : (
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#475569' }}>
                    Inactive
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
