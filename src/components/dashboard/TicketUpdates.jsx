import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TicketUpdates({ onTicketSelect, selectedTicketId }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('tickets-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTickets(current => current.filter(t => t.id !== payload.old.id))
          } else if (payload.eventType === 'INSERT') {
            setTickets(current => [payload.new, ...current])
          }
        }
      )
      .subscribe()

    // Listen for ticket deletions
    const handleTicketDeleted = (event) => {
      const deletedTicketId = event.detail
      setTickets(current => current.filter(t => t.id !== deletedTicketId))
    }
    window.addEventListener('ticket-deleted', handleTicketDeleted)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('ticket-deleted', handleTicketDeleted)
    }
  }, [])

  async function fetchTickets() {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Recent Tickets</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => onTicketSelect(ticket)}
              className={`p-3 rounded-lg transition-colors cursor-pointer
                ${selectedTicketId === ticket.id 
                  ? 'bg-indigo-50 hover:bg-indigo-100' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Ticket #{ticket.id}
                  </p>
                </div>
                <span className={`
                  px-2 py-1 text-xs rounded-full
                  ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}
                `}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {ticket.description}
              </p>
              <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                <span className="capitalize">{ticket.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 