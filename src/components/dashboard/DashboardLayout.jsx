import { useState } from 'react'
import NavigationBar from './NavigationBar'
import TicketUpdates from './TicketUpdates'
import MainContent from './MainContent'
import Header from './Header'

export default function DashboardLayout() {
  const [selectedView, setSelectedView] = useState('dashboard')

  return (
    <div className="h-screen flex bg-gray-100">
      <NavigationBar selectedView={selectedView} onViewChange={setSelectedView} />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <TicketUpdates />
          <MainContent view={selectedView} />
        </div>
      </div>
    </div>
  )
} 