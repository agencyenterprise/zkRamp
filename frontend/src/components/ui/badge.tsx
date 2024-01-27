export default function Badge({ children }: { children: string }) {
  return (
    <div className="inline-flex h-5 items-center justify-center rounded-[10px] bg-emerald-100 px-2.5 py-0.5">
      <span className="text-center font-inter text-xs font-medium leading-none text-emerald-800">
        {children}
      </span>
    </div>
  )
}
