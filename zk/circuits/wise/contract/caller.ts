import { getDeploymentData } from './getDeploymentData'
import { initPolkadotJs } from './initPolkadotJs'
import { ContractPromise } from '@polkadot/api-contract'
import {
  contractQuery,
  contractTx,
  decodeOutput,
  deployContract,
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

  // Update message
  try {
    // index_claim_order: u32,
    // status: ClaimStatus,
    // claim_expiration_time: Option<u128>,
    const expiration = new Date().getTime() + 1000 * 60 * 60
    await contractTx(api, account, contract, 'update_claim_order_status', {}, [orderId, "Filled", expiration])
    console.log('\nClosed deal with success')
  } catch (error) {
    console.error('Error while closing deal: ', error)
  }

  // // Read message
  // const result = await contractQuery(api, '', contract, 'greet')
  // const { decodedOutput } = decodeOutput(result, contract, 'greet')
  // console.log('\nQueried greeting:', decodedOutput)
}
