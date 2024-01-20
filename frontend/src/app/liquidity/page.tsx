'use client'

import LiquidityTable from '../components/liquidity-table'

export default function HomePage() {
  const Title = () => {
    return (
      <div className="mt-16 flex flex-col items-start gap-1 md:mt-0">
        <h1 className="text-2xl font-extrabold leading-loose text-white">Liquidity</h1>
        <h2 className="text-base font-normal leading-normal text-zinc-300">
          Click to buy an order
        </h2>
      </div>
    )
  }

  return (
    <>
      <div className="container relative flex grow flex-col items-center justify-center px-4 py-10 md:px-8">
        <main className="flex w-full flex-col gap-8">
          <Title />
          <LiquidityTable />
        </main>
      </div>
    </>
  )
}
