/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { XCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { fromBn } from 'evm-bn'
import toast from 'react-hot-toast'

import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

import Badge from '../../components/ui/badge'
import TimerAction from './timer-action'

export default function OrderTable({
  onOpenUploadReceiptModal,
  hackyWayToForceRerender,
}: {
  onOpenUploadReceiptModal: (order: any) => void
  hackyWayToForceRerender: number
}) {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.zkramp)
  const [orders, setOrders] = useState<any>([])
  const [claimOrders, setClaimOrders] = useState<any>([])

  const fetchAllOrders = async () => {
    if (!contract || !api) return

    const result = await contractQuery(api, '', contract, 'get_all_orders')
    const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_orders')
    if (isError) throw new Error(decodedOutput)

    setOrders(output)
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

  const filterMyOrders = (orders: any) => {
    return orders.filter((order: any) => {
      return order.owner == activeAccount?.address
    })
  }

  const filterMyClaimOrders = (claimOrders: any) => {
    return claimOrders
      .filter((claimOrder: any) => {
        return claimOrder.buyer == activeAccount?.address
      })
      .map((claimOrder: any) => {
        return {
          ...claimOrder,
          order: orders.filter((order: any) => {
            return order.id == claimOrder.orderIndex
          })[0],
        }
      })
  }

  useEffect(() => {
    refresh()
  }, [contract, api, hackyWayToForceRerender, activeAccount])

  const refresh = async () => {
    fetchAllOrders()
    fetchAllClaimOrders()
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

  const cancelClaimOrder = async (claimOrder: any) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(api, activeAccount.address, contract, 'cancel_claim_order', {}, [
      claimOrder.orderIndex,
    ])

    toast.success('Claim order canceled')
    await refresh()
  }

  const submitProofClaimUser = async (claimOrder: any) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(
      api,
      activeAccount.address,
      contract,
      'update_claim_order_status',
      {},
      [claimOrder.orderIndex, 'WaitingForSellerProof', new Date().getTime() + 1000 * 60 * 60],
    )

    toast.success('Proof claim user submitted')
    await refresh()
  }

  const cancelOrder = async (order: any) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(api, activeAccount.address, contract, 'cancel_order', {}, [order.id])

    toast.success('Order canceled')
    await refresh()
  }

  const submitProofSeller = async (order: any) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(
      api,
      activeAccount.address,
      contract,
      'update_claim_order_status',
      {},
      [order.id, 'Filled', new Date().getTime()],
    )

    toast.success('Proof seller submitted')
    await refresh()
  }

  const releaseFunds = async (claimOrder: any) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(api, activeAccount.address, contract, 'buyer_claim_order_funds', {}, [
      claimOrder.id,
    ])

    toast.success('Funds released')
    await refresh()
  }

  const getClaimOrder = (order: any) => {
    return claimOrders.filter((claimOrder: any) => {
      return claimOrder.orderIndex == order.id
    })[0]
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="w-full">
      <div className="flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <h1 className="pb-4 text-lg font-bold">Orders for sale</h1>
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
                    Token
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Depositor
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Available Amount
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-surface2">
                {filterMyOrders(orders).map((order: any) => (
                  <tr key={order.depositor}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-subtlest">
                      {order.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">AZERO</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {order.owner}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <div className="flex">
                        <img className="mr-2" src="/icons/azero.png" width={20} height={20} />
                        {order && fromBn(order.amountToSend.replaceAll(',', ''), 12)} AZERO
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {order.amountToReceive} USD
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <div className="flex items-center justify-start gap-2">
                        <Badge>{convertStatus(getStatus(order))}</Badge>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <div className="flex items-center justify-start gap-2">
                        {order && getStatus(order) == 'Open' && (
                          <>
                            <XCircleIcon
                              title="Cancel Order"
                              onClick={() => cancelOrder(order)}
                              className="h-6 w-6 cursor-pointer text-red-400"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <h1 className="pb-4 text-lg font-bold">Buying Orders</h1>
            <table className="min-w-full table-fixed border-spacing-x-10 divide-y divide-gray-300">
              <thead className="bg-surfaceHover">
                <tr>
                  <th
                    scope="col"
                    className="whitespace-pre py-3 pl-4 pr-3 text-left text-sm font-medium text-subtlest"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Token
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Depositor
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Available Amount
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-surface2">
                {filterMyClaimOrders(claimOrders).map((claimOrder: any) => (
                  <tr key={claimOrder.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-subtlest">
                      {claimOrder.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">AZERO</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {claimOrder.buyer}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <div className="flex">
                        <img className="mr-2" src="/icons/azero.png" width={20} height={20} />
                        {claimOrder &&
                          claimOrder.order &&
                          fromBn(claimOrder.order?.amountToSend.replaceAll(',', ''), 12)}{' '}
                        AZERO
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {claimOrder.order?.amountToReceive} USD
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <div className="flex items-center justify-start gap-2">
                        <Badge>{convertStatus(getStatus(claimOrder.order ?? ''))}</Badge>
                        {(claimOrder.status == 'WaitingForBuyerProof' ||
                          claimOrder.status == 'WaitingForSellerProof') &&
                          claimOrder.claimExpirationTime && (
                            <div className="flex justify-start py-1">
                              <TimerAction
                                claimOrder={claimOrder}
                                releaseFunds={releaseFunds}
                              ></TimerAction>
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <div className="flex items-center justify-start gap-2">
                        {claimOrder.status == 'WaitingForBuyerProof' && (
                          <>
                            <XCircleIcon
                              title="Cancel Order"
                              onClick={() => cancelClaimOrder(claimOrder)}
                              className="h-6 w-6 cursor-pointer text-red-400"
                            />
                            <ArrowUpTrayIcon
                              title="Submit Proof"
                              onClick={() => onOpenUploadReceiptModal(claimOrder.order)}
                              className="h-6 w-6 cursor-pointer text-zinc-100"
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
