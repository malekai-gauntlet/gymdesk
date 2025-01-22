import { useState } from 'react'
import { MagnifyingGlassIcon, HomeIcon, ClockIcon, StarIcon, UserIcon, UsersIcon, ArrowsRightLeftIcon, WindowIcon, CubeIcon, PuzzlePieceIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function SettingsSidebar({ onSectionChange, activeSection }) {
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const handleSectionClick = (section) => {
    onSectionChange(section)
  }

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search Admin Center"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="px-2 space-y-1">
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
          <HomeIcon className="mr-3 h-5 w-5 text-gray-400" />
          Home
        </button>
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
          <StarIcon className="mr-3 h-5 w-5 text-gray-400" />
          Discover
        </button>

        <div className="border-t border-gray-200 my-2"></div>

        {/* Account Button with Dropdown */}
        <div>
          <button 
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50"
          >
            <div className="flex items-center">
              <UserIcon className="mr-3 h-5 w-5 text-gray-400" />
              Account
            </div>
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isAccountOpen ? 'transform rotate-180' : ''}`}
            />
          </button>
          
          {/* Dropdown Menu */}
          <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isAccountOpen ? 'max-h-48' : 'max-h-0'}`}>
            <div className="pl-10 py-1">
              <button 
                onClick={() => handleSectionClick('billing')}
                className={`w-full text-left px-3 py-2 text-sm rounded-md
                  ${activeSection === 'billing' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Billing
              </button>
              <button 
                onClick={() => handleSectionClick('usage')}
                className={`w-full text-left px-3 py-2 text-sm rounded-md
                  ${activeSection === 'usage' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Usage
              </button>
              <button 
                onClick={() => handleSectionClick('security')}
                className={`w-full text-left px-3 py-2 text-sm rounded-md
                  ${activeSection === 'security' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Security
              </button>
              <button 
                onClick={() => handleSectionClick('appearance')}
                className={`w-full text-left px-3 py-2 text-sm rounded-md
                  ${activeSection === 'appearance' 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Appearance
              </button>
            </div>
          </div>
        </div>

        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
          <UsersIcon className="mr-3 h-5 w-5 text-gray-400" />
          People
        </button>
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
          <ArrowsRightLeftIcon className="mr-3 h-5 w-5 text-gray-400" />
          Channels
        </button>
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
          <WindowIcon className="mr-3 h-5 w-5 text-gray-400" />
          Workspaces
        </button>
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
          <CubeIcon className="mr-3 h-5 w-5 text-gray-400" />
          Objects and rules
        </button>
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
          <PuzzlePieceIcon className="mr-3 h-5 w-5 text-gray-400" />
          Apps and integrations
        </button>
      </nav>
    </div>
  )
} 