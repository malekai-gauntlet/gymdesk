export default function MainContent({ view }) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your tickets and view updates</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            New Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {['Open Tickets', 'Groups', 'Good', 'Solved'].map((stat, i) => (
            <div key={stat} className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">{stat}</p>
              <p className="text-2xl font-semibold">{i}</p>
            </div>
          ))}
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium">Tickets requiring your attention</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map((ticket) => (
                <tr key={ticket} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Open
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Sample Ticket #{ticket}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    John Doe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 hours ago
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 