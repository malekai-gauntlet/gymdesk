import { useState } from 'react'
import NavigationBar from './NavigationBar'
import TicketUpdates from './TicketUpdates'
import MainContent from './MainContent'
import Header from './Header'
import MemberSidebar from './MemberSidebar'
import SettingsSidebar from './SettingsSidebar'

export default function DashboardLayout() {
  const [selectedView, setSelectedView] = useState('dashboard')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket)
  }

  const handleSectionChange = (section) => {
    setSelectedSection(section)
  }

  const handleViewChange = (view) => {
    setSelectedView(view)
    // Reset section when changing main views
    if (view !== 'settings') {
      setSelectedSection(null)
    }
  }

  // Determine which sidebar to show
  const renderSidebar = () => {
    if (selectedView === 'settings' || selectedSection) {
      return <SettingsSidebar onSectionChange={handleSectionChange} activeSection={selectedSection} />
    }
    if (selectedView === 'customers') {
      return <MemberSidebar />
    }
    return <TicketUpdates onTicketSelect={handleTicketSelect} selectedTicketId={selectedTicket?.id} />
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <NavigationBar selectedView={selectedView} onViewChange={handleViewChange} />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex">
          {renderSidebar()}
          <MainContent 
            view={selectedSection || selectedView} 
            selectedTicket={selectedTicket}
            onTicketSelect={handleTicketSelect}
          />
        </div>
      </div>
    </div>
  )
} 