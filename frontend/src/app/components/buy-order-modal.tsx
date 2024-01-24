import dayjs from 'dayjs'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import { Button } from '../../components/ui/button'

interface Order {
  amountToReceive: string
  deposited: string
  hashName: string
  id: string
  nameLength: string
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

export default function BuyOrderModal({ order, claimedOrder, onClaimCreated, onClose }: Props) {
  if (!order && !claimedOrder) return null
  if (claimedOrder) {
    const diffInMinutes = dayjs(claimedOrder.claimExpirationTime).diff(dayjs(), 'minute')
    return (
      <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-opacity-50 transition-all">
        <div className="inline-flexx] flex-col items-center justify-start gap-6 rounded bg-zinc-950 p-6 shadow">
          <div className="flex flex-col items-center justify-start gap-6 self-stretch">
            <div className="flex flex-col items-center justify-start gap-2 self-stretch">
              <div className="self-stretch text-center font-['Manrope'] text-2xl font-bold leading-loose text-white">
                Order Created
              </div>
              <div className="font-['Azeret Mono'] self-stretch text-center text-base font-normal leading-normal text-zinc-300">
                You have 1h to pay the order, upload the receipt.
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-start gap-6 self-stretch rounded bg-zinc-900 p-6">
            <div className="relative">
              <CircularProgressbar
                value={100}
                text={`${diffInMinutes} min`}
                styles={{
                  root: {
                    width: 100,
                  },
                  path: {
                    stroke: '#10B981',
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
              <div className="self-stretch font-['Manrope'] text-base font-medium leading-normal text-zinc-400">
                Wise Payment Link
              </div>
              <div className="inline-flex items-center justify-start gap-2 self-stretch">
                <div className="shrink grow basis-0 font-['Manrope'] text-xl font-semibold leading-7 text-lime-300">
                  https://www.wise.com/payment?=0s849sf8
                </div>
                <div className="h-5px] relative" />
              </div>
            </div>
            <div className="inline-flex items-start justify-start gap-3 self-stretch">
              <div className="flex h-12 shrink grow basis-0 items-center justify-center gap-2 rounded bg-lime-300 px-6 py-3 shadow">
                <div className="font-['Manrope'] text-base font-semibold leading-normal text-zinc-950">
                  Confirm Payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (!order) return null
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
                {order.deposited}
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
              Exchange
            </div>
            <div className="inline-flex items-center justify-start gap-1 self-stretch">
              <div className="shrink grow basis-0 font-manrope text-xl font-semibold leading-7 text-zinc-100">
                0.34%
              </div>
            </div>
          </div>
          <div className="flex h-24 flex-col items-start justify-start gap-1 self-stretch rounded border border-zinc-800 bg-zinc-800 px-4 py-5">
            <div className="self-stretch font-manrope text-base font-medium leading-normal text-zinc-400">
              Total
            </div>
            <div className="inline-flex items-center justify-start gap-1 self-stretch">
              <div className="shrink grow basis-0 font-manrope text-xl font-semibold leading-7 text-zinc-100">
                {order.amountToReceive}
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
          <Button className="w-full" onClick={() => onClaimCreated(order)}>
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
