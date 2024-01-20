import { useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

import Badge from '../../components/ui/badge'

export default function OrderTable() {
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
  }, [contract, api])

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
      [claimOrder.orderIndex, 'WaitingForSellerProof'],
    )

    toast.success('Proof claim user submitted')
    await refresh()
  }

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
                      Exchange
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      Deposit Amount
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
                {filterMyOrders(orders).map((order: any) => (
                  <tr key={order.depositor}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-subtlest">
                      {order.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">AZERO</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {order.owner}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">-0.3%</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {order.amountToReceive}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <Badge>{convertStatus(getStatus(order))}</Badge>
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
                      Exchange
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest"
                  >
                    <a href="#" className="group inline-flex">
                      Deposit Amount
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
                {filterMyClaimOrders(claimOrders).map((claimOrder: any) => (
                  <tr key={claimOrder.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-subtlest">
                      {claimOrder.orderIndex}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">AZERO</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {claimOrder.buyer}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">-0.3%</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      {claimOrder.order?.amountToReceive}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">
                      <Badge>{convertStatus(getStatus(claimOrder.order ?? ''))}</Badge>
                      <button className="p-2" onClick={() => cancelClaimOrder(claimOrder)}>
                        cancel
                      </button>
                      <button className="p-2" onClick={() => submitProofClaimUser(claimOrder)}>
                        proof
                      </button>
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
