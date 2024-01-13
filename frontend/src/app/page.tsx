'use client'

import { useEffect } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { ChainInfo } from '@/components/web3/chain-info'
import { ConnectButton } from '@/components/web3/connect-button'
import { GreeterContractInteractions } from '@/components/web3/greeter-contract-interactions'

import { Button } from '../components/ui/button'
import { Background } from './components/background'
import { HeroHexagons } from './components/hero-hexagons'
import { HomeTopBar } from './components/home-top-bar'

export default function HomePage() {
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  const HeroText = () => {
    return (
      <div className="flex flex-col items-center gap-6">
        <h1 className="max-w-2xl text-center text-5xl font-extrabold leading-[60px] text-white">
          Lightning-fast BRL to AZERO Transaction with the highest level of security
        </h1>
        <h2 className="max-w-2xl text-center text-xl font-normal leading-7 text-zinc-300">
          zkDex leverages zero-knowledge proofs to ensure your transactions remain private while
          providing unmatched efficiency in onramp/offramp solutions.
        </h2>
      </div>
    )
  }

  return (
    <>
      <HomeTopBar />

      <div className="container relative flex grow flex-col items-center justify-center py-10">
        <main className="flex flex-col gap-8">
          <HeroText />
          <div className="flex items-center justify-center gap-6">
            <Button variant="outline">Add Liquidity</Button>
            <Button variant="default">Buy AZERO</Button>
          </div>
          <HeroHexagons />
        </main>
      </div>
      <Background />
    </>
  )
}
