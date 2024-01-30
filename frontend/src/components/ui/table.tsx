/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { fromBn } from 'evm-bn'
import toast from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import BuyOrderModal from '@/app/components/buy-order-modal'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

import Badge from './badge'

export default function Table() {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.zkramp)
  const [orders, setOrders] = useState<any>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [claimedOrder, setClaimedOrder] = useState<any>(null)
  const [claimOrders, setClaimOrders] = useState<any>([])
  const [showBuyerModal, setShowBuyerModal] = useState(false)

  const fetchAllOrders = async () => {
    if (!contract || !api) return

    const result = await contractQuery(api, '', contract, 'get_all_orders')
    const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_orders')
    if (isError) throw new Error(decodedOutput)

    setOrders(
      output.filter((order: any) => {
        return order.status != 'Canceled' && order.status != 'Filled'
      }),
    )
  }

  const fetchAllClaimOrders = async () => {
    if (!contract || !api) return

    const result = await contractQuery(api, '', contract, 'get_all_orders_claim')
    const { output, isError, decodedOutput } = decodeOutput(
      result,
      contract,
      'get_all_orders_claim',
    )
    if (isError) throw new Error(decodedOutput)
    setClaimOrders(output)
  }

  useEffect(() => {
    refresh()
  }, [contract, api])

  const refresh = async () => {
    await fetchAllOrders()
    await fetchAllClaimOrders()
  }

  const getStatus = (order: any): string => {
    const claimedOrder = claimOrders.filter((claimOrder: any) => {
      return claimOrder.orderIndex == order.id && claimOrder.status != 'Canceled'
    })

    if (claimedOrder.length > 0) {
      return claimedOrder[0].status
    }

    return order.status
  }

  const convertStatus = (status: string): string => {
    switch (status) {
      case 'Open':
        return 'Open'
      case 'WaitingForBuyerProof':
        return 'Pending Buyer'
      case 'WaitingForSellerProof':
        return 'Pending Seller'
      case 'Filled':
        return 'Filled'
      case 'Canceled':
        return 'Canceled'
      default:
        return 'Unknown'
    }
  }

  const createClaimOrder = async (order: any) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(api, activeAccount.address, contract, 'claim_order', {}, [
      order.id,
      new Date(new Date().getTime() + 60 * 60000).getTime(),
    ])

    setClaimedOrder({
      buyer: activeAccount.address,
      claimExpirationTime: new Date(new Date().getTime() + 60 * 60000),
      orderIndex: order.id,
      status: 'WaitingForSellerProof',
    })

    toast.success('Claim order created')
    await refresh()
  }

  const mockCreateOrder = async () => {
    await createClaimOrder(selectedOrder)
  }

  const selectOrder = (order: any) => {
    if (getStatus(order) == 'Open') {
      setSelectedOrder(order)
      setShowBuyerModal(true)
    }
  }

  return (
    <div className="w-full">
      {showBuyerModal && (
        <BuyOrderModal
          order={selectedOrder}
          claimedOrder={claimedOrder}
          onClose={() => setShowBuyerModal(false)}
          onClaimCreated={mockCreateOrder}
        />
      )}

      <div className="flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full table-fixed border-spacing-x-10 divide-y divide-gray-300">
              <thead className="bg-surfaceHover">
                <tr>
                  <th
                    scope="col"
                    className="whitespace-pre py-3 pl-4 pr-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      #
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      Token
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      Depositor
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      Available Amount
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      Price
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      Status
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-surface2">
                {orders.map((order: any) => {
                  return (
                    <tr
                      key={order.depositor}
                      onClick={() => selectOrder(order)}
                      className={twMerge(getStatus(order) == 'Open' && 'cursor-pointer')}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-subtlest">
                        {order.id}
                      </td>
                      <td className="flex whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                        <img className="mr-2" src="/icons/azero.png" width={20} height={20} />
                        AZERO
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                        {order.owner}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                        {fromBn(order.amountToSend.replaceAll(',', ''), 12)} AZERO
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                        {order.amountToReceive} USD
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                        <Badge>{convertStatus(getStatus(order))}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
