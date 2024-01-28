'use client'

import { useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
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
  const { contract } = useRegisteredContract(ContractIds.zkramp)

  const Title = () => {
    return (
      <div className="mt-16 flex w-full items-end justify-between gap-1 md:mt-0">
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

    await contractTxWithToast(
      api,
      activeAccount.address,
      contract,
      'create_order',
      {
        value: order.depositAmount * 2,
      },
      [order.receiveAmount, order.paymentKey, '', 0],
    )
  }

  return (
    <>
      <div className="container relative flex grow flex-col items-center justify-center px-4 py-10 md:px-8">
        <main className="flex flex-col gap-8">
          <Title />
          <OrderTable onOpenUploadReceiptModal={setSelectedOrderUploadReceipt} />

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
