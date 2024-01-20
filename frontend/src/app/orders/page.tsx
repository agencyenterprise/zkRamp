'use client'

import { useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

import OrderTable from '../components/order-table'
import PlaceOrderForm, { PaymentInfo } from '../components/place-order-form'

export default function OrdersPage() {
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

  const Title = () => {
    const { api, activeAccount, activeSigner } = useInkathon()
    const { contract, address: contractAddress } = useRegisteredContract(ContractIds.zkramp)

    const createOrder = async () => {
      if (!activeAccount || !contract || !activeSigner || !api) {
        toast.error('Wallet not connected. Try again…')
        return
      }

      const depositAmount = prompt('Enter deposit amount')

      if (!depositAmount) {
        toast.error('Deposit amount is required')
        return
      }

      const converteddepositAmount = parseInt(depositAmount || '0', 10)

      await contractTxWithToast(
        api,
        activeAccount.address,
        contract,
        'create_order',
        {
          value: converteddepositAmount,
        },
        [converteddepositAmount, 'transfer identifier', 'HASH_NAME', 1],
      )
    }

    return (
      <div className="mt-16 flex flex-col items-start gap-1 md:mt-0">
        <h1 className="text-2xl font-extrabold leading-loose text-white">Orders</h1>
        <h2 className="text-base font-normal leading-normal text-zinc-300">
          Create a order description
        </h2>
        <div className="right-0 m-auto">
          <Button onClick={createOrder}>Create Liquidity Pool</Button>
        </div>
      </div>
    )
  }

  const handleSubmit = (paymentInfo: PaymentInfo) => {
    console.log(paymentInfo)
  }

  return (
    <>
      <div className="container relative flex grow flex-col items-center justify-center px-4 py-10 md:px-8">
        <main className="flex flex-col gap-8">
          <Title />
          <OrderTable />

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
    </>
  )
}
