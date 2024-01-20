'use client'

import Link from 'next/link'
import { FC } from 'react'

import { Bars3Icon } from '@heroicons/react/24/outline'

import { Button } from '../../components/ui/button'

const navigation = [
  { name: 'Liquidity', href: '/liquidity' },
  { name: 'Deposits', href: '/about' },
  { name: 'Receipts', href: '/contact' },
]

export const HomeTopBar: FC = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-50 inline-flex h-16 w-full items-center justify-between bg-zinc-900 px-4 shadow md:px-32">
      <div className="flex items-center gap-6">
        <Bars3Icon className="h-6 w-6 text-zinc-400 md:hidden" />
        <a href="/">
          <img src="/vectors/logo.svg" alt="logo" className="h-8 w-auto" />
        </a>

        <nav className="hidden gap-6 md:flex">
          {navigation.map(({ name, href }) => (
            <Link key={name} href={href}>
              <span className="cursor-pointer text-sm font-semibold leading-tight text-zinc-100">
                {name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <div>
        <Button>Connect Wallet</Button>
      </div>
    </header>
  )
}
