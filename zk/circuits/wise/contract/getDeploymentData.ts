import { readFile } from 'fs/promises'
import path from 'path'

/**
 * Reads the contract deployment files (wasm & abi).
 * NOTE: Base directory can be configured via the `DIR` environment variable
 */
export const getDeploymentData = async (contractName: string) => {
  let abi, wasm
  try {
    abi = JSON.parse(await readFile("./contract/zkramp.json", 'utf-8'))
    wasm = await readFile("./contract/zkramp.wasm")
  } catch (e) {
    console.error(e)
    throw new Error("Couldn't find contract deployment files. Did you build it via `pnpm build`?")
  }

  return {
    abi,
    wasm,
  }
}
