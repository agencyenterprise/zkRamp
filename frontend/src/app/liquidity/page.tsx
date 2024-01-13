'use client'

import { Background } from '../components/background'
import { HomeTopBar } from '../components/home-top-bar'

export default function HomePage() {
  return (
    <>
      <HomeTopBar />

      <div className="container relative flex grow flex-col items-center justify-center px-4 py-10 md:px-8">
        <main className="flex flex-col gap-8"></main>
      </div>
      <Background />
    </>
  )
}
