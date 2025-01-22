import { HomeIcon, TicketIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Home', icon: HomeIcon, view: 'home' },
  { name: 'Tickets', icon: TicketIcon, view: 'dashboard' },
  { name: 'Customers', icon: UsersIcon, view: 'customers' },
  { name: 'Reports', icon: ChartBarIcon, view: 'reports' },
  { name: 'Settings', icon: Cog6ToothIcon, view: 'settings' },
]

export default function NavigationBar({ selectedView, onViewChange }) {
  return (
    <div className="w-16 bg-[#1B1D21] flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
        </svg>
      </div>

      {/* Navigation Icons */}
      <nav className="space-y-4">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => onViewChange(item.view)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors ${
              selectedView === item.view ? 'bg-gray-700' : ''
            }`}
          >
            <item.icon className="w-6 h-6 text-gray-300" />
          </button>
        ))}
      </nav>
    </div>
  )
} 