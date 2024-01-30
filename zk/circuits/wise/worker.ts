import { Worker } from 'bullmq';
import 'dotenv/config';
import { prove } from './prover';
import { closeDealWithSuccess, getOrderData } from './contract/caller';
import emlformat from 'eml-format'
import { decrypt } from './contract/secret'
import Pusher from 'pusher';
const REFERENCE_LINK_PATTERN = "transferDetails&lin=\nk="
const BASE_LINK_PATTERN = "transferDetails&lin="
const QUEUE_NAME = 'proveReceipt'
interface IRequestPayload {
    receipt: string
    orderId: string
}
const pusher = new Pusher({
    appId: process.env.APP_ID!,
    key: process.env.KEY!,
    secret: process.env.SECRET!,
    cluster: process.env.CLUSTER!,
    useTLS: true
});
async function notification(message: string, status: boolean, orderId?: string) {

    try {

        const orderIdMsg = `for order #${orderId}`

        pusher.trigger(process.env.CHANNEL!, process.env.EVENT, {
            message: `${message} ${orderId ? orderIdMsg : ""}`,
            status: status,
        });
    }
    catch (error) {
        console.log(error)
    }
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

async function hasCorrectSendAmount(receipt: string, amount: string, currency: string): Promise<boolean> {
    amount = amount.replace(",", ".")
    const rgx = `${amount}([0 - 9]*) \\s * ${currency}`
    receipt = receipt.replaceAll(",", ".")
    return receipt.search(new RegExp(rgx)) > -1
}

async function hasNameInReceipt(receipt: string, userName: string): Promise<boolean> {
    return emlformat.unquotePrintable(receipt).search(userName) > -1
}

async function parseReceiptId(receipt: string, orderId?: string): Promise<string> {
    const referenceIndex = receipt.search(BASE_LINK_PATTERN)
    if (referenceIndex < 0) {
        console.log("Invalid receipt! No reference Index")
        await notification("Invalid receipt! No reference Index", false, orderId)
        throw new Error("Invalid receipt")
    }
    console.log("Reference Index: ", referenceIndex)
    const base64Raw = receipt.slice(referenceIndex + REFERENCE_LINK_PATTERN.length + 3, referenceIndex + REFERENCE_LINK_PATTERN.length + 100)
    const b64Link = emlformat.unquotePrintable(base64Raw)

    const receiptId = Buffer.from(b64Link, "base64").toString("utf-8").split("/").slice(-1)[0].match(/^[0-9]+/g)
    if (!receiptId) {
        console.log("Invalid receipt! No receipt ID found")
        await notification("Invalid receipt! No receipt ID found", false, orderId)
        throw new Error("Invalid receipt! No receipt ID found")
    }
    console.log("Receipt ID: ", receiptId)
    return receiptId.join("")
}


const worker = new Worker(QUEUE_NAME, async job => {
    try {
        const { receipt, orderId } = job.data as IRequestPayload;
        const order = await getOrderData(+orderId)
        if (!order) {
            await notification("Order not found", false, orderId)
            throw new Error("Order not found")
        }
        const { amountToReceive, status, hashName } = JSON.parse(order)
        if (status === "Filled") {
            await notification("Order already filled", false, orderId)
            throw new Error("Order already filled")
        }
        if (!hashName) {
            await notification("No hash name found", false, orderId)
            throw new Error("No hash name found")
        }
        console.log(receipt.search("0,50 CAD"))
        const sellerName = await decrypt(hashName)
        const currency_usd = "USD"
        const hasCorrectAmountUSD = await hasCorrectSendAmount(receipt, amountToReceive, currency_usd)
        const currency_cad = "CAD"
        const hasCorrectAmountCAD = await hasCorrectSendAmount(receipt, amountToReceive, currency_cad)
        console.log(amountToReceive)
        if (!hasCorrectAmountUSD && !hasCorrectAmountCAD) {
            await notification("Invalid receipt amount", false, orderId)
            throw new Error("Invalid receipt amount")
        }
        console.log("Amount is valid")
        console.log(`Attempting to prove receipt for order ${orderId} with value ${amountToReceive} from ${sellerName} `)

        const hasSellerName = await hasNameInReceipt(receipt, sellerName)
        if (!hasSellerName) {
            await notification("Seller name not found in receipt", false, orderId)
            console.log("Seller name not found in receipt")
            throw new Error("Invalid receipt")
        }
        console.log("Seller name is valid")
        const receiptId = await parseReceiptId(receipt, orderId)
        console.log("Receipt ID: ", receiptId)
        console.log("Attempting to prove receipt...")
        const isvalidProof = await prove(receipt)
        if (!isvalidProof) {
            await notification("Invalid receipt! Proof is not valid", false, orderId)
            throw new Error("Invalid receipt! Proof is not valid")
        }
        console.log("Receipt is valid")
        await closeDealWithSuccess(+orderId)
        await notification("Deal closed with success", true, orderId)
        return isvalidProof
    } catch (error) {
        //await notification("Error while proving receipt", false)
        console.error("Error while proving receipt: ", error)
        return false
    }


}, {
    connection: {
        host: process.env.REDIS_URI!,
        port: +process.env.REDIS_PORT!,
        username: process.env.REDIS_USER!,
        password: process.env.REDIS_PASSWORD!
    },
    concurrency: 1,
    autorun: false,
    lockDuration: 600000
});

worker.run();