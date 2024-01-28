import { Queue, Worker } from 'bullmq';
import 'dotenv/config';
import { prove } from './prover';
const emlformat = require('eml-format');
const REFERENCE_LINK_PATTERN = "transferDetails&lin=\nk="
const BASE_LINK_PATTERN = "transferDetails&lin="
interface IRequestPayload {
    isBuyer: boolean
    receipt: string
    orderId: string
}
interface IOrder {
    value: string
    currency: string
    buyerName: string
    sellerName: string
    sellerAddress: string
    buyerAddress: string
    reiceiptId: string | undefined
}

const DKIM_INFO = {
    "domain": "wise.com", "s": "mriizrjk76ccxll4j6ckckpevf5xpb2j"
}
emlformat.un

async function hasDKIMSignature(receipt: string): Promise<boolean> {
    return receipt.search(DKIM_INFO.s) > -1
}


async function getOrderInfo(orderId: string): Promise<IOrder> {
    return { value: "100", currency: "USD", buyerName: "Glaicon Jose", sellerName: "Letícia Pires", sellerAddress: "0x123", buyerAddress: "0x456" } as IOrder
}
async function updateOrderInfo(orderId: string, receiptId): Promise<IOrder> {
    return { value: "100", currency: "USD", buyerName: "Glaicon Jose", sellerName: "Letícia Pires", sellerAddress: "0x123", buyerAddress: "0x456", reiceiptId: '925055335' } as IOrder
}
async function hasNameInReceipt(receipt: string, userName: string): Promise<boolean> {
    return emlformat.unquotePrintable(receipt).search(userName) > -1
}

async function parseReceiptId(receipt: string): Promise<string> {
    const referenceIndex = receipt.search(BASE_LINK_PATTERN)
    if (referenceIndex < 0) {
        console.log("Invalid receipt! No reference Index")
        throw new Error("Invalid receipt")
    }
    console.log("Reference Index: ", referenceIndex)
    const base64Raw = receipt.slice(referenceIndex + REFERENCE_LINK_PATTERN.length + 3, referenceIndex + REFERENCE_LINK_PATTERN.length + 100)
    const b64Link = emlformat.unquotePrintable(base64Raw)

    const receiptId = Buffer.from(b64Link, "base64").toString("utf-8").split("/").slice(-1)[0].match(/^[0-9]+/g)
    if (!receiptId) {
        console.log("Invalid receipt! No receipt ID found")
        throw new Error("Invalid receipt! No receipt ID found")
    }
    console.log("Receipt ID: ", receiptId)
    return receiptId.join("")
}

const receiptQueue = new Queue('proveReceipt', {
    connection: {
        host: process.env.REDIS_URI!,
        port: +process.env.REDIS_PORT!,
        username: process.env.REDIS_USER!,
        password: process.env.REDIS_PASSWORD!
    }
});


const worker = new Worker('proveReceipt', async job => {
    const { isBuyer, receipt, orderId } = job.data as IRequestPayload;
    const { value, currency, buyerName, sellerName, sellerAddress, buyerAddress } = await getOrderInfo(orderId)
    const hasDKIM = await hasDKIMSignature(receipt)
    if (!hasDKIM) {
        throw new Error("Invalid receipt Signature")
    }
    console.log("DKIM Signature is valid")
    console.log(`Attempting to prove receipt for order ${orderId} with value ${value} ${currency} for ${buyerName} from ${sellerName}`)
    if (isBuyer) {
        const hasSellerName = await hasNameInReceipt(receipt, sellerName)
        if (!hasSellerName) {
            console.log("Seller name not found in receipt")
            throw new Error("Invalid receipt")
        }
        console.log("Seller name is valid")
        const receiptId = await parseReceiptId(receipt)
        console.log("Receipt ID: ", receiptId)
        await updateOrderInfo(orderId, receiptId)
        console.log("Receipt ID updated")
    } else {
        const { reiceiptId } = await getOrderInfo(orderId)
        if (!reiceiptId) {
            throw new Error("Invalid receipt! Waiting buyer to prove receipt")
        }
        const hasBuyerName = await hasNameInReceipt(receipt, buyerName)
        if (!hasBuyerName) {
            throw new Error("Invalid receipt! No buyer found")
        }
        const hasSellerName = await hasNameInReceipt(receipt, sellerName)
        if (!hasSellerName) {
            throw new Error("Invalid receipt! No seller found")
        }
        const receivedReceiptId = await parseReceiptId(receipt)
        if (receivedReceiptId !== reiceiptId) {
            throw new Error("Invalid receipt! Receipt ID mismatch")
        }

    }
    console.log("Attempting to prove receipt...")
    const isvalidProof = await prove(receipt)
    if (!isvalidProof) {
        throw new Error("Invalid receipt! Proof is not valid")
    }
    console.log("Receipt is valid")
    return isvalidProof

}, {
    connection: {
        host: process.env.REDIS_URI!,
        port: +process.env.REDIS_PORT!,
        username: process.env.REDIS_USER!,
        password: process.env.REDIS_PASSWORD!
    },
    concurrency: 1,
    autorun: false
});

worker.run();