import { ConnectKitButton } from 'connectkit'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { arcTestnet } from 'viem/chains'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { TokenUSDC } from '@web3icons/react'
import { Wallet, Gamepad2 } from 'lucide-react'

const usdc = getUsdc(arcTestnet.id)

export default function WalletBar() {
  const { address, isConnected } = useAccount()

  const { data: rawBalance } = useReadContract(
    usdc && address
      ? {
          address: usdc.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
          chainId: arcTestnet.id,
        }
      : undefined
  )

  const formatted =
    rawBalance !== undefined && usdc
      ? Amount.fromRaw(rawBalance, usdcDecimalsFor(arcTestnet.id)).toFixed(2)
      : null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Gamepad2 size={20} color="#fbbf24" />
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            color: '#f9faf3',
            letterSpacing: '-0.02em',
          }}
        >
          Arc World
        </span>
      </div>

      {/* Right: balance + connect */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isConnected && formatted !== null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '5px 12px',
            }}
          >
            <TokenUSDC size={16} variant="branded" />
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                color: '#f9faf3',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatted}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>USDC</span>
          </div>
        )}

        {isConnected && address && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: '5px 12px',
            }}
          >
            <Wallet size={13} color="#94a3b8" />
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: '#cbd5e1',
              }}
            >
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          </div>
        )}

        <ConnectKitButton />
      </div>
    </div>
  )
}
