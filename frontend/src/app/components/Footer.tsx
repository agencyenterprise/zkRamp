import Link from 'next/link'

export const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col items-center justify-center gap-1 bg-[black] p-3 text-sm font-normal md:h-11 md:flex-row md:gap-4 md:p-2.5">
        <span className="font-medium">Made with 🧡 by AE Studio.</span>

        <span>See what we could build for you</span>
        <Link
          href="https://ae.studio?utm_term=5e9e4933-985a-4431-b11f-d9b552ce2fb2&utm_campaign=inno-pod&utm_source=innopod&utm_medium=referral"
          target="_blank"
          className="font-semibold"
          data-analytics="learn-more-about-ae-link"
        >
          Learn more →
        </Link>
      </div>
    </footer>
  )
}
