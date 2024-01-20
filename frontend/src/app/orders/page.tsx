'use client'

import { useState } from 'react'

import { Button } from '../../components/ui/button'
import { Background } from '../components/background'
import { HomeTopBar } from '../components/home-top-bar'
import LiquidityTable from '../components/liquidity-table'
import PlaceOrderForm, { PaymentInfo } from '../components/place-order-form'

export default function HomePage() {
  const [showPlaceOrderForm, setShowPlaceOrderForm] = useState(false)

  const EmptyDepositsTitle = () => {
    return (
      <div className="mt-16 flex flex-col items-center gap-1 md:mt-0">
        <h1 className="text-2xl font-extrabold leading-loose text-white">Orders</h1>
        <h2 className="text-base font-normal leading-normal text-zinc-300">No deposits found</h2>
      </div>
    )
  }

  const NewDepositsTitle = () => {
    return (
      <div className="mt-16 flex flex-col items-center gap-1">
        <h1 className="text-2xl font-extrabold leading-loose text-white">New Order</h1>
        <h2 className="text-base font-normal leading-normal text-zinc-300">
          Placing a new order in the pool
        </h2>
      </div>
    )
  }

  const handleSubmit = (paymentInfo: PaymentInfo) => {
    console.log(paymentInfo)
  }

  return (
    <>
      <HomeTopBar />

      <div className="container relative flex grow flex-col items-center justify-center px-4 py-10 md:px-8">
        <main className="flex flex-col items-center gap-8">
          {!showPlaceOrderForm && (
            <>
              <EmptyDepositsTitle />
              <Button onClick={() => setShowPlaceOrderForm(true)}>Place An Order</Button>
            </>
          )}
          {showPlaceOrderForm && (
            <>
              <NewDepositsTitle />
              <PlaceOrderForm onSubmit={handleSubmit} />
            </>
          )}
        </main>
      </div>
      <Background />
    </>
  )
}
