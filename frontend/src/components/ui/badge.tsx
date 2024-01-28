import { twMerge } from 'tailwind-merge'

export default function Badge({ children }: { children: string }) {
  return (
    <div
      className={twMerge(
        'inline-flex h-5 items-center justify-center rounded-[10px] px-2.5 py-0.5',
        children == 'Open' && 'bg-emerald-100',
        children == 'Filled' && 'bg-blue-300',
        children == 'Canceled' && 'bg-red-300',
        (children == 'Pending Buyer' || children == 'Pending Seller') && 'bg-yellow-100',
      )}
    >
      <span
        className={twMerge(
          'text-center font-inter text-xs font-medium leading-none ',
          children == 'Open' && 'text-emerald-800',
          children == 'Filled' && 'text-blue-800',
          children == 'Canceled' && 'text-red-800',
          (children == 'Pending Buyer' || children == 'Pending Seller') && 'text-yellow-800',
        )}
      >
        {children}
      </span>
    </div>
  )
}
