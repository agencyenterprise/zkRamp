import { getDeploymentData } from './getDeploymentData'
import { initPolkadotJs } from './initPolkadotJs'
import { ContractPromise } from '@polkadot/api-contract'
import {
  contractTx,
  contractQuery,
  decodeOutput,
  // @ts-ignore
} from '@scio-labs/use-inkathon/helpers'

/**
 * Example script that updates & reads a message from a zkramp contract.
 * Can be used as a template for other scripts.
 *
 * Parameters:
 *  - `DIR`: Directory to read contract build artifacts (optional, defaults to `./deployments`)
 *  - `CHAIN`: Chain ID (optional, defaults to `development`)
 *
 * Example usage:
 *  - `pnpm run script <script-name>`
 *  - `CHAIN=alephzero-testnet pnpm run script <script-name>`
 */
export const closeDealWithSuccess = async (orderId: number) => {
  const { api, account } = await initPolkadotJs()

  // Deploy zkramp contract
  const { abi, wasm } = await getDeploymentData('zkramp')
  const contract = new ContractPromise(api, abi, '5DkLDqiYkGNGk5Xa4WxtPcf9EWtmteUdV1VrNJ749PTQaH9z')
  const expiration = new Date().getTime() + 1000 * 60 * 60
  await contractTx(api, account, contract, 'update_claim_order_status', {}, [orderId, "Filled", expiration])
  console.log('\nClosed deal with success')

}


export const getOrderData = async (orderId: number) => {
  const { api, account } = await initPolkadotJs()
  const { abi, wasm } = await getDeploymentData('zkramp')
  const contract = new ContractPromise(api, abi, '5DkLDqiYkGNGk5Xa4WxtPcf9EWtmteUdV1VrNJ749PTQaH9z')
  const result = await contractQuery(api, '', contract, 'get_order', {}, [orderId])
  const { decodedOutput } = decodeOutput(result, contract, 'get_order')
  return decodedOutput
}