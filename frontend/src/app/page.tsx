/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { PusherProvider, useChannel, useEvent } from '@harelpls/use-pusher'
import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { Button } from '../components/ui/button'
import { HeroHexagons } from './components/hero-hexagons'

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

interface IMessage {
  status: boolean
  message: string
  user_id: string
  data?: any
  medata?: any
  metadata?: { user_id: string } | undefined
}
export default function HomePage() {
  const channel = useChannel(`public`)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])
  const config = {
    // required config props
    clientKey: process.env.NEXT_PUBLIC_CLIENT_ID!,
    cluster: process.env.NEXT_PUBLIC_CLUSTER!,
  }
  const customToast = (message: any, status: boolean) => {
    toast(
      (t) => (
        <span>
          {message}
          <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
        </span>
      ),
      {
        icon: status ? '🧡' : '🔥',
      },
    )
  }
  useEvent(channel, 'proof_result', (message: any) => {
    if (message.status) {
      customToast(message.text, message.status)
    } else {
      customToast(message.text, message.status)
    }
  })
  const HeroText = () => {
    return (
      <div className="mt-16 flex flex-col items-center gap-6">
        <h1 className="max-w-2xl text-center text-3xl font-extrabold leading-9 text-white md:text-5xl md:leading-[60px]">
          Lightning-fast USD to AZERO Transaction with the highest level of security
        </h1>
        <h2 className="max-w-2xl text-center text-xl font-normal leading-normal text-zinc-300 md:leading-7">
          ZKRamp leverages zero-knowledge proofs to ensure your transactions remain private while
          providing unmatched efficiency in onramp/offramp solutions.
        </h2>
      </div>
    )
  }

  return (
    <>
      <PusherProvider {...config}>
        <div className="container relative flex grow flex-col items-center justify-center px-4 py-10 md:px-8">
          <main className="flex flex-col gap-8">
            <HeroText />
            <div className="mb-6 flex items-center justify-center gap-6 px-2 md:mb-0">
              <Button className="h-12 w-1/2 md:h-auto md:w-auto" variant="outline">
                <Link href="orders">Add Liquidity</Link>
              </Button>
              <Button className="h-12 w-1/2 md:h-auto md:w-auto" variant="default">
                <Link href="liquidity">Buy AZERO</Link>
              </Button>
            </div>
            <HeroHexagons />
            {/* <ZKRampContractInteractions /> */}
          </main>
        </div>
      </PusherProvider>
    </>
  )
}
