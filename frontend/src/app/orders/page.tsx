'use client'

import { useState, useEffect } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import Pusher from 'pusher-js'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

import Modal from '../../components/ui/modal'
import OrderTable from '../components/order-table'
import PlaceOrderForm from '../components/place-order-form'
import UploadReceiptModal from '../components/upload-receipt-modal'

export default function OrdersPage() {
  const [showPlaceOrderForm, setShowPlaceOrderForm] = useState(false)
  const [selectedOrderUploadReceipt, setSelectedOrderUploadReceipt] = useState<any>(null)
  const { api, activeAccount, activeSigner } = useInkathon()
  const [hackyWayToForceRerender, setHackyWayToForceRerender] = useState(0)

  const { contract } = useRegisteredContract(ContractIds.zkramp)

  const Title = () => {
    return (
      <div className="mt-16 flex w-full items-end justify-between gap-1">
        <h1 className="text-2xl font-extrabold leading-loose text-white">Orders</h1>
        <Button onClick={() => setShowPlaceOrderForm(true)}>Place An Order</Button>
      </div>
    )
  }

  const createOrder = async (order: any) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    let amountToTransfer = Number(order.depositAmount.replaceAll('.', ''))
    const decimals = 12 - (order.depositAmount.split('.')[1]?.length ?? 0)
    for (let index = 0; index < decimals; index++) {
      amountToTransfer = amountToTransfer * 10
    }

    await contractTxWithToast(
      api,
      activeAccount.address,
      contract,
      'create_order',
      {
        value: amountToTransfer * 2,
      },
      [order.receiveAmount, order.paymentKey, order.name, 0],
    )
    setShowPlaceOrderForm(false)
    setHackyWayToForceRerender((prev) => prev + 1)
  }
  const customToast = (message: string, status: boolean) => {
    toast(
      (t) => (
        <span>
          {message}
          <XMarkIcon width={20} title="close" onClick={() => toast.dismiss(t.id)}></XMarkIcon>
        </span>
      ),
      {
        icon: status ? '🧡' : '🔥',
      },
    )
  }
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_CLIENT_ID!, {
      cluster: process.env.NEXT_PUBLIC_CLUSTER!,
    })

    const channel = pusher.subscribe(process.env.NEXT_PUBLIC_CHANNEL!)
    channel.bind(process.env.NEXT_PUBLIC_EVENT!, function (message: any) {
      console.log(message)
      if (message.status) {
        customToast(message.message, message.status)
      } else {
        customToast(message.message, message.status)
      }
    })
    return () => {
      pusher.unsubscribe(process.env.NEXT_PUBLIC_CHANNEL!)
    }
  }, [])
  return (
    <>
      <div className="container relative flex grow flex-col items-center justify-center px-4 py-10 md:px-8">
        <main className="flex flex-col gap-8">
          <Title />
          <OrderTable
            hackyWayToForceRerender={hackyWayToForceRerender}
            onOpenUploadReceiptModal={setSelectedOrderUploadReceipt}
          />

          {selectedOrderUploadReceipt && (
            <UploadReceiptModal
              selectedOrder={selectedOrderUploadReceipt}
              onClose={() => setSelectedOrderUploadReceipt(null)}
            />
          )}

          {showPlaceOrderForm && (
            <Modal>
              <PlaceOrderForm onSubmit={createOrder} onClose={() => setShowPlaceOrderForm(false)} />
            </Modal>
          )}
        </main>
      </div>
    </>
  )
}
