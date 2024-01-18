import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Badge from './badge'

// dummy data
const data = [
  { index: 1, token: 'AZERO', depositor: 'fx45xj....98s72', exchange: '-0.3%', depositAmount: 1.000, status: "Badge" },
  { index: 2, token: 'AZERO', depositor: 'e3r4xj....98s72', exchange: '0.34%', depositAmount: 2.000, status: "Badge" },
  { index: 3, token: 'AZERO', depositor: 'fx45xj....98s72', exchange: '-0.3%', depositAmount: 1.000, status: "Badge" },
  { index: 4, token: 'AZERO', depositor: 'e3r4xj....98s72', exchange: '0.34%', depositAmount: 2.000, status: "Badge" },
  { index: 5, token: 'AZERO', depositor: 'fx45xj....98s72', exchange: '-0.3%', depositAmount: 1.000, status: "Badge" },
  { index: 6, token: 'AZERO', depositor: 'e3r4xj....98s72', exchange: '0.34%', depositAmount: 2.000, status: "Badge" },
  { index: 7, token: 'AZERO', depositor: 'fx45xj....98s72', exchange: '-0.3%', depositAmount: 1.000, status: "Badge" },
]

export default function Table() {
  return (
    <div className="w-full">
      <div className="flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full border-spacing-x-10 divide-y table-fixed divide-gray-300">
              <thead className='bg-surfaceHover'>
                <tr>
                  <th scope="col" className="whitespace-pre py-3 pl-4 pr-3 text-left text-sm font-medium text-subtlest">
                    <a href="#" className="group inline-flex">
                      #
                    </a>
                  </th>
                  <th scope="col" className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest">
                    <a href="#" className="group inline-flex">
                      Token
                    </a>
                  </th>
                  <th scope="col" className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest">
                    <a href="#" className="group inline-flex">
                      Depositor
                    </a>
                  </th>
                  <th scope="col" className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest">
                    <a href="#" className="group inline-flex">
                      Exchange
                    </a>
                  </th>
                  <th scope="col" className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest">
                    <a href="#" className="group inline-flex">
                      Deposit Amount
                    </a>
                  </th>
                  <th scope="col" className="whitespace-pre px-6 py-3 text-left text-sm font-medium text-subtlest">
                    <a href="#" className="group inline-flex">
                      Status
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-surface2">
                {data.map((person) => (
                  <tr key={person.depositor}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-subtlest">
                      {person.index}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">{person.token}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">{person.depositor}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">{person.exchange}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest">{person.depositAmount}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-subtlest"><Badge>{person.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}