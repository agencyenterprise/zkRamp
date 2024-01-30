/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NextRequest, NextResponse } from 'next/server'

import { Queue } from 'bullmq'

const QUEUE_NAME = process.env.QUEUE_NAME!
const receiptQueue = new Queue(QUEUE_NAME, {
  connection: {
    host: process.env.REDIS_URI!,
    port: +process.env.REDIS_PORT!,
    username: process.env.REDIS_USER!,
    password: process.env.REDIS_PASSWORD!,
  },
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  // Remember to enforce type here and after use some lib like zod.js to check it
  const files = formData.getAll('file') as File[]
  const orders = formData.getAll('orderId') as string[]
  const orderId = orders[0]
  const payload = {
    isBuyer: true,
    receipt: await files[0].text(),
    orderId: orderId,
  }
  console.log(payload)
  await receiptQueue.add(QUEUE_NAME, payload)
  return NextResponse.json({ message: 'Proof sent! :)' })
}
