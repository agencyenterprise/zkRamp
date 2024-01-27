import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export type PaymentInfo =
  | {
      type: 'PIX'
      key: string
    }
  | {
      type: 'TED'
      bank: string
      branch: string
      account: string
      cpf: string
    }

export default function PlaceOrderForm({
  onSubmit,
}: {
  onSubmit: (paymentInfo: PaymentInfo) => void
}) {
  // useStates here

  const FormInput = ({
    title,
    subtitle,
    placeholder,
  }: {
    title: string
    subtitle?: string
    placeholder: string
  }) => {
    return (
      <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-opacity-50 transition-all">
        <div className="inline-flex w-full flex-col items-start justify-start gap-1 rounded border border-zinc-800 bg-zinc-900 px-4 py-2">
          <div className="inline-flex items-center justify-between gap-3 self-stretch">
            <div className="shrink grow basis-0 font-manrope text-base font-medium leading-normal text-zinc-400">
              {title}
            </div>
          </div>
          {!!subtitle && (
            <div className="h-5 font-manrope text-sm font-normal leading-tight text-zinc-500">
              {subtitle}
            </div>
          )}
          <div className="inline-flex items-center justify-start gap-1 self-stretch px-1.5 py-2">
            <Input
              placeholder={placeholder}
              className="shrink grow basis-0 font-manrope text-base font-normal leading-tight text-zinc-500"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-opacity-50 transition-all">
      <div className="inline-flex flex-col items-start justify-center gap-4 rounded border border-zinc-800 bg-zinc-950 p-4">
        <div className="font-manrope text-lg font-semibold leading-7 text-zinc-100">Order</div>
        <div className="inline-flex flex-col items-start justify-start gap-1 rounded border border-zinc-800 bg-zinc-900 px-4 py-5">
          <div className="inline-flex items-center justify-between gap-3 self-stretch">
            <div className="shrink grow basis-0 font-manrope text-base font-medium leading-normal text-zinc-400">
              Select your transfer identifier
            </div>
            <div className="flex items-center justify-start gap-2 border border-zinc-800 bg-zinc-950 px-2 py-1.5">
              <div className="relative h-4 w-4" />
              <div className="font-manrope text-xs font-semibold leading-none text-zinc-300">
                PIX Nubank
              </div>
              <div className="relative h-2.5 w-2.5" />
            </div>
          </div>
          <div className="inline-flex items-center justify-start gap-1 self-stretch px-1.5 py-2">
            <Input
              placeholder="PIX key"
              className="shrink grow basis-0 font-manrope text-base font-normal leading-tight text-zinc-500"
            />
          </div>
        </div>
        <FormInput
          title="Identify yourself"
          subtitle="Don't worry, this information is private"
          placeholder="Your name"
        />
        <FormInput title="Deposit Amount" subtitle="Colateral description here" placeholder="0" />
        <FormInput title="Exchange" placeholder="0" />
        <Button className="w-full">Place Order</Button>
      </div>
    </div>
  )
}
