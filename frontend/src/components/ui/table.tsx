import { ChevronDownIcon } from '@heroicons/react/20/solid'

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
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-subtlest sm:pl-0">
                    <a href="#" className="group inline-flex">
                      #
                    </a>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-subtlest">
                    <a href="#" className="group inline-flex">
                      Token
                    </a>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-subtlest">
                    <a href="#" className="group inline-flex">
                      Depositor
                    </a>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-subtlest">
                    <a href="#" className="group inline-flex">
                      Exchange
                    </a>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-subtlest">
                    <a href="#" className="group inline-flex">
                      Deposit Amount
                    </a>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-subtlest">
                    <a href="#" className="group inline-flex">
                      Status
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-surface2">
                {data.map((person) => (
                  <tr key={person.depositor}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {person.index}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.token}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.depositor}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.exchange}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.depositAmount}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.status}</td>
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