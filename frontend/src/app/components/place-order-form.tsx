import { useState } from 'react'

import { XCircleIcon } from '@heroicons/react/24/outline'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

const FormInput = ({
  title,
  subtitle,
  placeholder,
  value,
  setValue,
}: {
  title: string
  subtitle?: string
  placeholder: string
  value: string
  setValue: (value: string) => void
}) => {
  return (
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
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          className="shrink grow basis-0 font-manrope text-base font-normal leading-tight text-zinc-500"
        />
      </div>
    </div>
  )
}

export default function PlaceOrderForm({
  onSubmit,
  onClose,
}: {
  onSubmit: (order: any) => void
  onClose: () => void
}) {
  const [paymentKey, setPaymentKey] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')

  return (
    <div className="inline-flex flex-col items-start justify-center gap-4 rounded border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex w-full items-center justify-between">
        <div className="font-manrope text-lg font-semibold leading-7 text-zinc-100">
          Create Order
        </div>
        <XCircleIcon onClick={onClose} className="h-6 w-6 cursor-pointer text-zinc-100" />
      </div>
      <div className="inline-flex flex-col items-start justify-start gap-1 rounded border border-zinc-800 bg-zinc-900 px-4 py-5">
        <div className="inline-flex items-center justify-between gap-3 self-stretch">
          <div className="shrink grow basis-0 font-manrope text-base font-medium leading-normal text-zinc-400">
            Select your transfer identifier
          </div>
          <div className="flex items-center justify-start gap-2 border border-zinc-800 bg-zinc-950 px-2 py-1.5">
            <div className="relative h-4 w-4" />
            <img src="/vectors/wise.svg" alt="Wise" />
            <div className="relative h-2.5 w-2.5" />
          </div>
        </div>
        <div className="inline-flex items-center justify-start gap-1 self-stretch px-1.5 py-2">
          <Input
            placeholder="Wisetag"
            value={paymentKey}
            onChange={(e) => {
              setPaymentKey(e.target.value)
            }}
            className="shrink grow basis-0 font-manrope text-base font-normal leading-tight text-zinc-500"
          />
        </div>
      </div>
      <FormInput
        title="Deposit Amount"
        value={depositAmount}
        setValue={setDepositAmount}
        subtitle="Colateral description here"
        placeholder="0"
      />
      <FormInput
        title="Receive Amount"
        value={receiveAmount}
        setValue={setReceiveAmount}
        placeholder="0"
      />
      <Button
        className="w-full"
        onClick={() =>
          onSubmit({
            paymentKey,
            depositAmount,
            receiveAmount,
          })
        }
      >
        Place Order
      </Button>
    </div>
  )
}
