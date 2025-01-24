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
    <h3 className="text-xl font-semibold mb-4">Your Upcoming Events</h3>
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

const ClassBooking = () => (
  <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
    <h3 className="text-xl font-semibold mb-4">Available Classes</h3>
    <div className="space-y-3 mb-4">
      <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">HIIT Class</p>
            <p className="text-sm text-gray-400">Tomorrow, 9:00 AM • 8 slots</p>
          </div>
        </div>
      </div>
      <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">Yoga Flow</p>
            <p className="text-sm text-gray-400">Tomorrow, 10:30 AM • 5 slots</p>
          </div>
        </div>
      </div>
    </div>
    <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-[#e12c4c] hover:bg-[#d11b3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12c4c] transition-colors">
      Book a Class
    </button>
  </div>
)

const PTBooking = () => (
  <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
    <h3 className="text-xl font-semibold mb-4">Available Personal Training Sessions</h3>
    <div className="space-y-3 mb-4">
      <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">30 Min Session</p>
            <p className="text-sm text-gray-400">Available with John, Sarah</p>
          </div>
        </div>
      </div>
      <div className="p-3 bg-white/5 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">60 Min Session</p>
            <p className="text-sm text-gray-400">Available with all trainers</p>
          </div>
        </div>
      </div>
    </div>
    <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-[#e12c4c] hover:bg-[#d11b3b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e12c4c] transition-colors">
      Schedule a Session
    </button>
  </div>
)

const SupportForm = () => {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAIMode, setIsAIMode] = useState(false)
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
        priority: 'medium',
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
    } catch (error) {
      console.error('Full Error Object:', error)
      toast.error('Failed to create support request. Please try again.')
    } finally {
      console.log('=== Submission Process Complete ===')
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className={`rounded-xl p-8 backdrop-blur-sm ${
      isAIMode 
        ? "bg-gradient-to-r from-[#e12c4c]/10 to-[#1a1b23] border border-[#e12c4c]/20" 
        : "bg-white/5"
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isAIMode ? "bg-[#e12c4c]/20" : "bg-white/5"
          }`}>
            {isAIMode ? (
              <svg className="w-6 h-6 text-[#e12c4c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              {isAIMode ? "Ask AI Assistant" : "Ask Our Staff"}
            </h3>
            <p className="text-sm text-gray-400">
              {isAIMode 
                ? "Get instant answers about membership, classes, facilities, and more"
                : "Get help from our gym staff - we typically respond within an hour"
              }
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="Voice input"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button
            onClick={() => setIsAIMode(!isAIMode)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-sm text-gray-400">AI Mode</span>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
              isAIMode ? "bg-[#e12c4c]" : "bg-gray-600"
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                isAIMode ? "translate-x-4" : "translate-x-1"
              }`} />
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            className={`w-full rounded-lg px-4 py-3 text-white placeholder-gray-400 text-lg ${
              isAIMode 
                ? "border border-[#e12c4c]/20 bg-white/5 focus:border-[#e12c4c] focus:ring-[#e12c4c]"
                : "border border-gray-600 bg-white/5 focus:border-gray-500 focus:ring-gray-500"
            }`}
            placeholder={isAIMode ? "Ask anything about the gym..." : "What can we help you with?"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <textarea
            rows={3}
            className={`w-full rounded-lg px-4 py-3 text-white placeholder-gray-400 ${
              isAIMode 
                ? "border border-[#e12c4c]/20 bg-white/5 focus:border-[#e12c4c] focus:ring-[#e12c4c]"
                : "border border-gray-600 bg-white/5 focus:border-gray-500 focus:ring-gray-500"
            }`}
            placeholder={isAIMode ? "Add more details to your question..." : "Provide any additional details..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 py-2 px-6 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isAIMode
                ? "bg-[#e12c4c] hover:bg-[#d11b3b] focus:ring-[#e12c4c]"
                : "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isAIMode ? "Ask AI" : "Send Message"}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function MemberPortal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate('/')
    }
  }

  return (
    <div className="bg-[#1a1b23] text-white p-8 h-screen overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.first_name || 'Member'}</h1>
          <div className="flex items-center gap-4">
            <span className="px-4 py-1 rounded-full bg-[#e12c4c]/20 text-[#e12c4c] text-sm">
              Premium Member
            </span>
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-300 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white/10 backdrop-blur-sm ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                      <p className="font-medium">{user?.user_metadata?.first_name} {user?.user_metadata?.last_name}</p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                    </div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                      Account Settings
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                      Billing
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <SupportForm />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UpcomingEvents />
          <VisitHistory />
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClassBooking />
            <PTBooking />
          </div>
        </div>
      </div>
    </div>
  )
} 