import { FC } from 'react'

export const Background: FC = () => {
  return (
    <img
      src="/vectors/bg.svg"
      alt="bg"
      className="absolute inset-0 -z-50 h-full w-full bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-900"
    />
  )
}
