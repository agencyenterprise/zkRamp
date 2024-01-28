import { useEffect, useState } from 'react'

import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'

export default function TimerAction({
  claimOrder,
  releaseFunds,
}: {
  claimOrder: any
  releaseFunds?: (claimOrder: any) => Promise<any>
}) {
  const [timesLeft, setTimesLeft] = useState<any>()

  useEffect(() => {
    const interval = setInterval(() => {
      if (!claimOrder) return

      let time = claimOrder.claimExpirationTime.replaceAll(',', '')
      time = time.slice(0, time.length - 3)
      // TODO: I set it to 1 minute and the unit to seconds for testing the progress bar, we should change the unit back to 'minute'
      const diffInSeconds = dayjs(dayjs.unix(time).toDate()).diff(dayjs(), 'minutes')
      if (diffInSeconds <= 0) {
        setTimesLeft(diffInSeconds)
        clearInterval(interval)
        return
      }
      setTimesLeft(diffInSeconds)
    }, 1000)
  }, [claimOrder])

  return (
    <>
      {timesLeft && timesLeft < 0 && (
        <>
          <Button onClick={() => releaseFunds!(claimOrder)}>Release Funds</Button>
        </>
      )}
      {timesLeft && timesLeft > 0 && `${timesLeft} mins`}
    </>
  )
}
