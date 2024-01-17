import { FC } from 'react'

export const Background: FC = () => {
  return (
    <div
      style={{
        backgroundImage: "url('/vectors/bg.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
      }}
      className="absolute inset-0 -z-50 h-full w-full bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-900"
    />
  )
}
