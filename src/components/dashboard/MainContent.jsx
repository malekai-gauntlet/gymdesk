import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import TicketDetail from './TicketDetail'
import CustomerList from './CustomerList'
import Settings from './Settings'
import BillingContent from './BillingContent'
import TeamMembers from './TeamMembers'

export default function MainContent({ view, selectedTicket, onTicketSelect }) {
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState({
    openTickets: 0,
    groups: 0,
    good: 0,
    solved: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState(null)

  useEffect(() => {
    fetchTickets()
    // Set up real-time subscription
    const subscription = supabase
      .channel('tickets-main-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          fetchTickets() // Refetch tickets when any changes occur
        }
      )
      .subscribe()

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.ticket-menu')) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('click', handleClickOutside)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const fetchTickets = async () => {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          member:created_by (
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to include member_email
      const ticketsWithEmail = tickets.map(ticket => ({
        ...ticket,
        member_email: ticket.member?.email
      }))

      setTickets(ticketsWithEmail)
      
      // Update stats
      const stats = {
        openTickets: tickets.filter(t => t.status === 'open').length,
        solved: tickets.filter(t => t.status === 'closed').length,
        good: tickets.filter(t => t.priority === 'low').length,
        groups: new Set(tickets.map(t => t.created_by)).size // Unique requesters
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTicket = (ticket) => {
    // Use the same function as clicking the ticket
    onTicketSelect(ticket)
    setActiveMenu(null)
  }

  const handleDeleteTicket = async (ticket) => {
    try {
      console.log('Deleting ticket:', ticket.id)
      
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticket.id)

      if (error) {
        console.error('Delete Error:', error)
        throw error
      }

      // Emit a custom event to notify other components
      const event = new CustomEvent('ticket-deleted', { detail: ticket.id })
      window.dispatchEvent(event)

    } catch (error) {
      console.error('Delete operation failed:', error)
    }
    setActiveMenu(null)
  }

  const handleTicketClick = (ticket) => {
    onTicketSelect(ticket)
    setActiveMenu(null)
  }

  // Render different content based on view
  const renderContent = () => {
    switch (view) {
      case 'billing':
        return <BillingContent />
      case 'settings':
        return <Settings />
      case 'customers':
        return <CustomerList />
      case 'people-team-members':
        return <TeamMembers />
      case selectedTicket:
        return <TicketDetail ticket={selectedTicket} onClose={() => onTicketSelect(null)} />
      default:
        return (
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
              {[
                { label: 'Open Tickets', value: stats.openTickets },
                { label: 'Groups', value: stats.groups },
                { label: 'Good', value: stats.good },
                { label: 'Solved', value: stats.solved }
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
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
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        </div>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No tickets found
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ticket.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.member_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ticket.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative ticket-menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation() // Prevent row click when clicking menu
                                setActiveMenu(activeMenu === ticket.id ? null : ticket.id)
                              }}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </button>
                            
                            {activeMenu === ticket.id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditTicket(ticket)
                                  }}
                                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteTicket(ticket)
                                  }}
                                  className="block w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100 text-left"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  )
} 