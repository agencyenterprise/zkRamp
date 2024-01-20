'use client'

import { FC } from 'react'

import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

export const ZKRampContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.zkramp)

  const fetchAllOrders = async () => {
    if (!contract || !api) return

    const result = await contractQuery(api, '', contract, 'get_all_orders')
    const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_orders')
    if (isError) throw new Error(decodedOutput)
    console.log('Get All Orders')
    console.log(decodedOutput)
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
    console.log('Get All Claim Orders')
    console.log(decodedOutput)
  }

  const fetchOrder = async () => {
    if (!activeAccount || !contract || !api) return

    const result = await contractQuery(api, activeAccount.address, contract, 'get_order', {}, [0])
    const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_order')
    if (isError) throw new Error(decodedOutput)
    console.log('Get Order')
    console.log(decodedOutput)
  }

  const createOrder = async () => {
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
        value: 11,
      },
      [1, 'test', 'test', 1],
    )
  }

  const createClaimOrder = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(
      api,
      activeAccount.address,
      contract,
      'claim_order',
      {},
      [0, 1705475714000],
    )
  }

  const cancelOrder = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(api, activeAccount.address, contract, 'cancel_order', {}, [0])
  }

  const cancelClaimOrder = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    await contractTxWithToast(api, activeAccount.address, contract, 'cancel_claim_order', {}, [0])
  }

  const updateClaimOrderStatus = async () => {
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
      [0, 'Filled'],
    )
  }

  if (!api) return null

  return (
    <>
      <div className="flex max-w-[22rem] grow flex-col gap-4">
        <h2 className="text-center font-mono text-gray-400">ZKRamp Smart Contract</h2>

        <button className="w-sm rounded bg-slate-800" onClick={fetchAllOrders}>
          Get All Orders
        </button>
        <button className="w-sm rounded bg-slate-800" onClick={fetchAllClaimOrders}>
          Get All Claim Orders
        </button>
        <button className="w-sm rounded bg-slate-800" onClick={fetchOrder}>
          Get Order
        </button>
        <button className="w-sm rounded bg-slate-800" onClick={createOrder}>
          Create Liquidity Pool
        </button>
        <button className="w-sm rounded bg-slate-800" onClick={cancelOrder}>
          Cancel Liquidity Pool
        </button>
        <button className="w-sm rounded bg-slate-800" onClick={createClaimOrder}>
          Claim Liquidity Pool
        </button>
        <button className="w-sm rounded bg-slate-800" onClick={cancelClaimOrder}>
          Cancel Claim Liquidity Pool
        </button>
        <button className="w-sm rounded bg-slate-800" onClick={updateClaimOrderStatus}>
          Update Claim Liquidity Pool
        </button>

        {/* Contract Address */}
        <p className="text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  )
}
