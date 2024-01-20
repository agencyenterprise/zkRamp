import React, { FC } from 'react'

const HEXAGONS = [
  {
    icon: 'select.svg',
    title: 'Select an order',
    text: 'Select the order that suits you best.',
  },
  {
    icon: 'pay.svg',
    title: 'Pay the order',
    text: 'You can block the order for one hour to pay.',
  },
  {
    icon: 'confirm.svg',
    title: 'Confirm Payment',
    text: 'Prove payment by uploading the email sent by Wise',
  },
  {
    icon: 'receive.svg',
    title: 'Receive your crypto',
    text: 'There is nothing else to be done. AZERO is in your wallet',
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
      <div className="flex flex-row gap-4 md:flex-col md:items-center md:gap-2">
        <img src={`/vectors/${icon}`} alt={icon} />
        <div className="-mt-5 flex flex-col items-start gap-2 md:items-center md:gap-4">
          <span className="text-center font-azaretMono text-xs font-normal uppercase leading-tight text-zinc-100">
            Step {step}
          </span>
          <span className="text-xl font-bold leading-7 text-white">{title}</span>
          <p className="text-start font-azaretMono text-base font-normal leading-normal text-zinc-300 md:text-center">
            {text}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
      {HEXAGONS.map((hexagon, i) => (
        <React.Fragment key={hexagon.title}>
          <Hexagon {...hexagon} step={i + 1} />
          {i !== HEXAGONS.length - 1 && (
            <img
              src="/vectors/arrow.svg"
              alt="arrow"
              className="relative -mt-44 hidden origin-bottom-right md:block"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
