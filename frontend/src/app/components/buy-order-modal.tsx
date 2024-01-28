import { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import { fromBn } from 'evm-bn'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import { Button } from '../../components/ui/button'

interface Order {
  amountToReceive: string
  amountToSend: any
  id: string
  owner: string
  paymentKey: string
  status: string
}
interface ClaimedOrder {
  buyer: string
  claimExpirationTime: string
  orderIndex: string
  status: string
}

interface Props {
  order?: Order
  claimedOrder?: ClaimedOrder
  onClaimCreated: (order: Order) => void
  onClose: () => void
}

const interpolateColor = (color1: string, color2: string, ratio: number): string => {
  const hex = (color: string): number => parseInt(color.substring(1), 16)

  // Adjust ratio for three-phase transition
  let adjustedRatio: number
  if (ratio < 0.3) {
    // Green dominant phase (0% - 30%)
    adjustedRatio = 0
  } else if (ratio < 0.7) {
    // Transition phase (30% - 70%)
    adjustedRatio = (ratio - 0.3) / 0.4
  } else {
    // Red dominant phase (70% - 100%)
    adjustedRatio = 1
  }

  const r = Math.ceil(
    (1 - adjustedRatio) * (hex(color1) >> 16) + adjustedRatio * (hex(color2) >> 16),
  )
  const g = Math.ceil(
    (1 - adjustedRatio) * ((hex(color1) >> 8) & 0x00ff) +
      adjustedRatio * ((hex(color2) >> 8) & 0x00ff),
  )
  const b = Math.ceil(
    (1 - adjustedRatio) * (hex(color1) & 0x0000ff) + adjustedRatio * (hex(color2) & 0x0000ff),
  )

  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`
}

export default function BuyOrderModal({ order, claimedOrder, onClaimCreated, onClose }: Props) {
  const [timeLeft, setTimeLeft] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!claimedOrder) return
      // TODO: I set it to 1 minute and the unit to seconds for testing the progress bar, we should change the unit back to 'minute'
      const diffInSeconds = dayjs(claimedOrder.claimExpirationTime).diff(dayjs(), 'minutes')
      if (diffInSeconds <= 0) {
        setTimeLeft(diffInSeconds)
        clearInterval(interval)
        return
      }
      setTimeLeft(diffInSeconds)
    }, 1000)
    return () => clearInterval(interval)
  }, [claimedOrder])

  if (claimedOrder) {
    const progressBarColor = interpolateColor('#BEF264', '#f87171', 1 - timeLeft / 60)
    return (
      <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-opacity-50 transition-all">
        <div className="inline-flex flex-col items-center justify-start gap-6 rounded bg-zinc-950 p-6 shadow">
          <div className="flex flex-col items-center justify-start gap-6 self-stretch">
            <div className="flex flex-col items-center justify-start gap-2 self-stretch">
              <div className="self-stretch text-center font-manrope text-2xl font-bold leading-loose text-white">
                Order Claimed
              </div>
              <div className="self-stretch text-center font-azaretMono text-base font-normal leading-normal text-zinc-300">
                You have 1h to pay the order, and upload the receipt.
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-start gap-6 self-stretch rounded bg-zinc-900 p-6">
            <div className="relative">
              <CircularProgressbar
                value={(timeLeft / 60) * 100}
                text={`${timeLeft} min`}
                styles={{
                  root: {
                    width: 100,
                  },
                  path: {
                    stroke: progressBarColor,
                    strokeLinecap: 'butt',
                    transition: 'stroke-dashoffset 0.5s ease 0s',
                  },
                  trail: {
                    stroke: '#4B5563',
                    strokeLinecap: 'butt',
                  },
                  text: {
                    fill: '#fff',
                    fontSize: '16px',
                    dominantBaseline: 'middle',
                    textAnchor: 'middle',
                  },
                }}
              />
            </div>
            <div className="flex h-24 flex-col items-start justify-start gap-1 self-stretch rounded border border-zinc-800 bg-zinc-800 px-4 py-5">
              <div className="self-stretch font-manrope text-base font-medium leading-normal text-zinc-400">
                Wise Payment Link
              </div>
              <div className="inline-flex items-center justify-start gap-2 self-stretch">
                <div className="shrink grow basis-0 font-manrope text-xl font-semibold leading-7 text-lime-300">
                  <a href={order?.paymentKey} className="cursor-pointer">
                    {order?.paymentKey}
                  </a>
                </div>
                <div className="h-5px] relative" />
              </div>
            </div>
            <div className="inline-flex items-start justify-start gap-3 self-stretch">
              <div className="flex h-12 shrink grow basis-0 items-center justify-center gap-2 rounded bg-lime-300 px-6 py-3 shadow">
                <Button className="w-full" onClick={onClose}>
                  Confirm Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const createClaimOrder = async () => {
    console.log('createClaimOrder', order)
    onClaimCreated(order!)
  }

  return (
    <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-opacity-50 transition-all">
      <div className="inline-flex flex-col items-center justify-start gap-6 rounded bg-zinc-950 p-6 shadow">
        <div className="flex h-16 flex-col items-center justify-start gap-6 self-stretch">
          <div className="flex h-16 flex-col items-center justify-start gap-2 self-stretch">
            <div className="self-stretch text-center font-manrope text-2xl font-bold leading-loose text-white">
              Buy Order
            </div>
            <div className="self-stretch text-center font-azaretMono text-base font-normal leading-normal text-zinc-300">
              Do you want to block and buy this order?
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-start gap-6 self-stretch rounded bg-zinc-900 p-6">
          <div className="self-stretch font-manrope text-lg font-bold leading-7 text-white">
            Summary
          </div>
          <div className="flex h-24 flex-col items-start justify-start gap-1 self-stretch rounded border border-zinc-800 bg-zinc-800 px-4 py-5">
            <div className="self-stretch font-manrope text-base font-medium leading-normal text-zinc-400">
              Buying
            </div>
            <div className="inline-flex items-center justify-start gap-1 self-stretch">
              <div className="shrink grow basis-0 font-manrope text-xl font-semibold leading-7 text-zinc-100">
                {fromBn(order?.amountToSend.replaceAll(',', ''), 12)}
              </div>
              <div className="flex items-center justify-center gap-2.5 self-stretch rounded-sm border border-zinc-600 bg-zinc-900 px-1.5">
                <div className="font-azaretMono text-base font-normal leading-normal text-zinc-500">
                  AZERO
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-24 flex-col items-start justify-start gap-1 self-stretch rounded border border-zinc-800 bg-zinc-800 px-4 py-5">
            <div className="self-stretch font-manrope text-base font-medium leading-normal text-zinc-400">
              Total
            </div>
            <div className="inline-flex items-center justify-start gap-1 self-stretch">
              <div className="shrink grow basis-0 font-manrope text-xl font-semibold leading-7 text-zinc-100">
                {order?.amountToReceive}
              </div>
              <div className="flex w-11 items-center justify-center gap-2.5 self-stretch rounded-sm border border-zinc-600 bg-zinc-900 px-1.5">
                <div className="font-azaretMono text-base font-normal leading-normal text-zinc-500">
                  BRL
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-start gap-3 self-stretch">
          <Button className="w-full" onClick={createClaimOrder}>
            Buy
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
