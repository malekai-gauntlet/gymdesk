import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase, sendTicketNotification } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

// Components for each section
const VisitHistory = () => {
  // Sample visit data with dates and times
  const visits = [
    { date: 'January 15, 2024', time: '9:30 AM' },
    { date: 'January 13, 2024', time: '4:15 PM' },
    { date: 'January 10, 2024', time: '7:45 AM' },
  ]

  return (
    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-4">Recent Visits</h3>
      <div className="space-y-3">
        {visits.map((visit, index) => (
          <div key={index} className="p-3 bg-white/5 rounded-lg">
            <p className="font-medium">{visit.date}</p>
            <p className="text-sm text-gray-400">{visit.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const MembershipStatus = () => (
  <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold">Membership Status</h3>
      <span className="text-green-400 font-medium">Active</span>
    </div>
    <button
      className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-full text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
    >
      View Membership Details
    </button>
  </div>
)

const UpcomingEvents = () => (
  <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
    <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
    <div className="space-y-3">
      {/* Placeholder for events */}
      <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">HIIT Class</p>
            <p className="text-sm text-gray-400">Tomorrow, 9:00 AM</p>
          </div>
          <button className="text-sm text-[#e12c4c] hover:text-[#d11b3b]">
            Cancel
          </button>
        </div>
      </div>
      <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">PT Session with John</p>
            <p className="text-sm text-gray-400">Jan 20, 2:00 PM</p>
          </div>
          <button className="text-sm text-[#e12c4c] hover:text-[#d11b3b]">
            Reschedule
          </button>
        </div>
      </div>
    </div>
  </div>
)

const SupportForm = () => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      console.log('=== Starting Ticket Submission ===')
      
      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current Session:', {
        accessToken: session?.access_token ? 'Present' : 'Missing',
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      })
      
      // First verify if the user exists in the users table
      console.log('Checking if user exists in users table...')
      const { data: userExists, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user?.id)
        .single()

      console.log('User check result:', { userExists, userCheckError })
      
      if (userCheckError) {
        console.error('Error checking user:', userCheckError)
        throw new Error('Failed to verify user existence')
      }

      console.log('User from Context:', {
        id: user?.id,
        email: user?.email,
        metadata: user?.user_metadata,
        role: user?.role,
        aud: user?.aud
      })

      if (!user?.id) {
        console.error('No user ID available!')
        throw new Error('User ID is required')
      }

      // Ensure created_by is treated as UUID
      const created_by = user.id // Don't convert to string, keep as UUID
      console.log('Created By (UUID):', created_by)

      const ticketData = {
        title,
        description: message,
        priority,
        status: 'open',
        created_by,
        comments: [],
        history: []
      }
      
      console.log('Ticket Data to Insert:', JSON.stringify(ticketData, null, 2))

      // Step 1: Create ticket in database
      console.log('Attempting database insert...')
      const { data: ticket, error: dbError } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single()

      if (dbError) {
        console.error('Database Error Details:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          status: dbError.status,
          query: dbError.query,
          errorType: typeof dbError
        })
        throw dbError
      }

      console.log('Ticket created successfully:', ticket)

      // Step 2: Send email notification
      console.log('Attempting to send email notification...')
      const { error: emailError } = await sendTicketNotification({
        ...ticketData,
        member_email: user?.email
      })

      if (emailError) {
        console.error('Email Error Details:', emailError)
        toast.success('Ticket created, but notification email failed to send')
      } else {
        console.log('Email sent successfully')
        toast.success('Support request sent successfully!')
      }

      // Clear form
      setTitle('')
      setMessage('')
      setPriority('medium')
    } catch (error) {
      console.error('Full Error Object:', error)
      toast.error('Failed to create support request. Please try again.')
    } finally {
      console.log('=== Submission Process Complete ===')
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-600 bg-gray-600/50 px-3 py-2 text-white placeholder-gray-300 focus:border-[#e12c4c] focus:ring-[#e12c4c]"
            placeholder="Title of your request"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-600/50 px-3 py-2 text-white focus:border-[#e12c4c] focus:ring-[#e12c4c]"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <div>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-600 bg-gray-600/50 px-3 py-2 text-white placeholder-gray-300 focus:border-[#e12c4c] focus:ring-[#e12c4c]"
            placeholder="How can we help you?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-[#e12c4c] hover:bg-[#d11b3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12c4c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}

export default function MemberPortal() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1b23] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.first_name || 'Member'}</h1>
          <div className="flex items-center gap-4">
            <span className="px-4 py-1 rounded-full bg-[#e12c4c]/20 text-[#e12c4c] text-sm">
              Premium Member
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-1 rounded-full border border-gray-600 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VisitHistory />
          <MembershipStatus />
          <UpcomingEvents />
          <SupportForm />
        </div>
      </div>
    </div>
  )
} 