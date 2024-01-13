import { FC } from 'react'

const HEXAGONS = [
  {
    icon: 'select.svg',
    title: 'Select',
    text: 'Select the order that suits you best.',
  },
  {
    icon: 'pay.svg',
    title: 'Pay',
    text: 'Pay with your preferred payment method.',
  },
  {
    icon: 'confirm.svg',
    title: 'Confirm',
    text: 'Confirm your transaction and receive your AZERO.',
  },
  {
    icon: 'receive.svg',
    title: 'Receive',
    text: 'Receive your AZERO in your wallet.',
  },
]

export const HeroHexagons: FC = () => {
  //text-center text-zinc-100 text-xs font-normal font-['Azeret Mono'] uppercase leading-tight

  const Hexagon = ({
    icon,
    title,
    step,
    text,
  }: {
    icon: string
    title: string
    step: number
    text: string
  }) => {
    return (
      <div className="flex flex-col items-center gap-2">
        <img src={`/vectors/${icon}`} alt="select" />
        <div className="-mt-5 flex flex-col items-center gap-4">
          <span className="text-center font-azaretMono text-xs font-normal uppercase leading-tight text-zinc-100">
            Step {step}
          </span>
          <span className="text-xl font-bold leading-7 text-white">{title}</span>
          <p className="text-center font-azaretMono text-base font-normal leading-normal text-zinc-300">
            {text}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {HEXAGONS.map((hexagon, i) => (
        <>
          <Hexagon key={hexagon.title} {...hexagon} step={i + 1} />
          {i !== HEXAGONS.length - 1 && (
            <img
              src="/vectors/arrow.svg"
              alt="arrow"
              className="relative -mt-12 origin-bottom-right"
            />
          )}
        </>
      ))}
    </div>
  )
}
