import * as crypto from 'crypto'

const algorithm = 'aes-256-ctr'
const ENCRYPTION_KEY = Buffer.from(process.env.PRIVATE_KEY!, 'base64')
const IV_LENGTH = 16

export async function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export async function POST(req: any) {
  const data = await req.json()

  // Encrypt the name using the private key
  const responseBase64 = await encrypt(data.name)

  return new Response(JSON.stringify({ encryptedName: responseBase64 }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
