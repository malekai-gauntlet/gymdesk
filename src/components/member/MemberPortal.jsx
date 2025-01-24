import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase, sendTicketNotification } from '../../lib/supabaseClient'
import openai from '../../lib/openaiClient'
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

const EditableCell = ({ value, onChange, type = "text" }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue !== value) {
      onChange(editValue)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      if (editValue !== value) {
        onChange(editValue)
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(value)
    }
  }

  if (isEditing) {
    return (
      <input
        type={type}
        className="w-full bg-white/10 text-white border-0 p-1 focus:ring-1 focus:ring-[#e12c4c] rounded"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    )
  }

  return (
    <div 
      className="cursor-pointer group relative"
      onClick={handleClick}
    >
      <span>{value}</span>
      <div className="absolute inset-0 border border-[#e12c4c]/0 group-hover:border-[#e12c4c]/20 rounded pointer-events-none transition-colors" />
    </div>
  )
}

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
      toast.error('Failed to create support request. Please try again.', {
        duration: 5000
      })
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

const WorkoutLog = () => {
  const [workoutData, setWorkoutData] = useState([
    {
      id: 1,
      muscleGroup: 'Pull',
      date: '12/15/2024',
      gym: 'Fitness',
      exercise: 'Lat Pulldown',
      weight: '100 & 200',
      sets: '2',
      reps: '10',
      bodyweight: '195.8',
      notes: 'Failed on the first set of the second set. Had really good contraction, this was the first time.'
    },
    {
      id: 2,
      muscleGroup: 'Pull',
      date: '12/17/2024',
      gym: 'Blink',
      exercise: 'Chest Press',
      weight: '45 & 25',
      sets: '2',
      reps: '10',
      bodyweight: '191.8',
      notes: 'N/A'
    },
    {
      id: 3,
      muscleGroup: 'Push',
      date: '12/19/2024',
      gym: 'Fitness',
      exercise: 'Bench Press',
      weight: '185',
      sets: '3',
      reps: '8',
      bodyweight: '192.3',
      notes: 'Feeling strong today, might increase weight next session'
    }
  ])

  // Initialize speech recognition and states
  const [recognition, setRecognition] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')

  const parseTranscript = async (transcript) => {
    try {
      console.log('Starting OpenAI request with transcript:', transcript)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a fitness tracking assistant. Parse the following workout description and extract the information in a JSON format with the following fields: muscle_group, exercise, weight, sets, reps, bodyweight (if mentioned), notes (any additional comments). Return null for any fields not mentioned. Return only the JSON object without any markdown formatting."
        }, {
          role: "user",
          content: transcript
        }],
        temperature: 0.7,
      })

      const response = completion.choices[0].message
      console.log('Raw OpenAI Response:', response)

      const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim()
      console.log('Cleaned content:', cleanContent)

      const parsedData = JSON.parse(cleanContent)
      console.log('Parsed workout data:', parsedData)

      const workoutEntry = createWorkoutEntry(parsedData)
      console.log('Created workout entry:', workoutEntry)

      // Add new workout entry to the state
      const newWorkout = {
        id: workoutData.length + 1,
        date: new Date().toLocaleDateString(),
        gym: 'Current Gym',
        ...workoutEntry
      }
      
      setWorkoutData(prevData => [...prevData, newWorkout])
      
      // Show success notification with longer duration
      toast.success(`Successfully logged ${newWorkout.exercise || 'workout'}!`, {
        duration: 5000
      })
      
      return parsedData
      
    } catch (error) {
      console.error('Error parsing workout data:', error)
      toast.error('Failed to log workout. Please try again.', {
        duration: 5000
      })
      return {
        muscle_group: null,
        exercise: null,
        weight: null,
        sets: null,
        reps: null,
        bodyweight: null,
        notes: null
      }
    }
  }

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      
      recognition.onstart = () => {
        setIsListening(true)
        setCurrentTranscript('')
      }

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ')
        setCurrentTranscript(transcript)
        console.log('Current transcript:', transcript)
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
      }

      setRecognition(recognition)
    } else {
      console.error('Speech recognition not supported in this browser')
    }
  }, []) // Remove currentTranscript dependency

  const handleMicrophoneClick = async () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      // Make OpenAI call after stopping if we have a transcript
      if (currentTranscript) {
        await parseTranscript(currentTranscript)
      }
      // Clear transcript after delay
      setTimeout(() => {
        setCurrentTranscript('')
      }, 10000)
    } else {
      recognition.start()
    }
  }

  const handleCellChange = (id, field, newValue) => {
    setWorkoutData(workoutData.map(workout => 
      workout.id === id 
        ? { ...workout, [field]: newValue }
        : workout
    ))
  }

  // Add this new function
  const createWorkoutEntry = (parsedData) => {
    console.log('Creating workout entry from:', parsedData)
    
    return {
      muscleGroup: parsedData.muscle_group || 'Unknown',
      exercise: parsedData.exercise || '',
      weight: parsedData.weight ? `${parsedData.weight}` : '',
      sets: parsedData.sets ? `${parsedData.sets}` : '',
      reps: parsedData.reps ? `${parsedData.reps}` : '',
      bodyweight: parsedData.bodyweight ? `${parsedData.bodyweight}` : '',
      notes: parsedData.notes || '',
      // We'll add date and ID in the next steps
    }
  }

  const handleDeleteWorkout = (id) => {
    setWorkoutData(prevData => prevData.filter(workout => workout.id !== id))
    toast.success('Workout removed successfully')
  }

  return (
    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-white/90">AI Workout Tracking</h3>
          <div className="relative group">
            <button
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              title="How it works"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="absolute left-0 top-full mt-2 w-80 p-4 rounded-lg bg-gray-900/95 backdrop-blur-sm shadow-xl border border-gray-800 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
              <h4 className="font-medium text-white mb-2">How to Log Your Workout</h4>
              <p className="text-sm text-gray-300 mb-3">
                Simply click the microphone icon and speak your workout details naturally. The AI will automatically parse and log your workout in the table below.
              </p>
              <div className="text-sm text-gray-400">
                <p className="mb-2">Example phrases:</p>
                <p className="italic mb-1">"Today I did bicep curls, three sets of ten, and I was able to do the third set very well."</p>
                <p className="italic">"Just finished bench press at 185 pounds, did 4 sets of 8 reps. Feeling strong today."</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isListening && (
            <span className="text-sm text-gray-400">
              Recording... {currentTranscript && '(Speaking)'}
            </span>
          )}
          <button
            onClick={handleMicrophoneClick}
            className={`p-2.5 rounded-full transition-colors text-gray-400 hover:text-white group relative ${
              isListening ? 'bg-[#e12c4c]/20 text-[#e12c4c]' : 'bg-white/5 hover:bg-white/10'
            }`}
            title={isListening ? "Stop recording" : "Record workout"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div className={`absolute inset-0 border rounded-full pointer-events-none transition-colors ${
              isListening ? 'border-[#e12c4c] animate-pulse' : 'border-[#e12c4c]/0 group-hover:border-[#e12c4c]/20'
            }`} />
          </button>
        </div>
      </div>
      
      {/* Show current transcript while recording or for a moment after stopping */}
      {currentTranscript && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-[#e12c4c]/20">
          <p className="text-sm text-gray-300">{currentTranscript}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800 border border-gray-800 rounded-lg">
          <thead>
            <tr className="bg-white/5">
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Muscle Group
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Date
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Which Gym?
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Exercise
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Weight
              </th>
              <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Sets
              </th>
              <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Reps
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-r border-gray-800">
                Bodyweight
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {workoutData.map(workout => (
              <tr key={workout.id} className="hover:bg-white/5 group">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-white/90 border-r border-gray-800">
                  <EditableCell 
                    value={workout.muscleGroup} 
                    onChange={(newValue) => handleCellChange(workout.id, 'muscleGroup', newValue)} 
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-800">
                  <EditableCell 
                    value={workout.date} 
                    onChange={(newValue) => handleCellChange(workout.id, 'date', newValue)} 
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-800">
                  <EditableCell 
                    value={workout.gym} 
                    onChange={(newValue) => handleCellChange(workout.id, 'gym', newValue)} 
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-800">
                  <EditableCell 
                    value={workout.exercise} 
                    onChange={(newValue) => handleCellChange(workout.id, 'exercise', newValue)} 
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-800">
                  <EditableCell 
                    value={workout.weight} 
                    onChange={(newValue) => handleCellChange(workout.id, 'weight', newValue)} 
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 text-center border-r border-gray-800">
                  <EditableCell 
                    value={workout.sets} 
                    onChange={(newValue) => handleCellChange(workout.id, 'sets', newValue)} 
                    type="number"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 text-center border-r border-gray-800">
                  <EditableCell 
                    value={workout.reps} 
                    onChange={(newValue) => handleCellChange(workout.id, 'reps', newValue)} 
                    type="number"
                  />
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-800">
                  <EditableCell 
                    value={workout.bodyweight} 
                    onChange={(newValue) => handleCellChange(workout.id, 'bodyweight', newValue)} 
                    type="number"
                  />
                </td>
                <td className="px-3 py-4 text-sm text-gray-300 relative">
                  <div className="flex items-center">
                    <EditableCell 
                      value={workout.notes} 
                      onChange={(newValue) => handleCellChange(workout.id, 'notes', newValue)} 
                    />
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-[#e12c4c] transition-colors opacity-0 group-hover:opacity-100 absolute right-2"
                      title="Delete workout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const MemberSidebar = ({ activeView, onViewChange }) => (
  <div className="w-64 flex-shrink-0 bg-white/5 border-r border-gray-800 overflow-y-auto h-screen">
    <div className="p-4">
      <h2 className="text-lg font-semibold text-white mb-6 px-3">Member Portal</h2>
      <nav className="space-y-1">
        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Support
          </p>
          <div className="mt-2">
            <button
              onClick={() => onViewChange('support')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'support' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Member Support
            </button>
          </div>
        </div>

        <div className="pt-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Schedule
          </p>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => onViewChange('upcoming')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'upcoming' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Your Upcoming Events
            </button>
            <button
              onClick={() => onViewChange('classes')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'classes' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Available Classes
            </button>
            <button
              onClick={() => onViewChange('training')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'training' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Personal Training
            </button>
          </div>
        </div>

        <div className="pt-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Activity
          </p>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => onViewChange('visits')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'visits' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Recent Visits
            </button>
            <button
              onClick={() => onViewChange('logs')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'logs' 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              AI Workout Tracking
            </button>
          </div>
        </div>
      </nav>
    </div>
  </div>
)

export default function MemberPortal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [activeView, setActiveView] = useState('support')

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate('/')
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case 'support':
        return <SupportForm />
      case 'upcoming':
        return <UpcomingEvents />
      case 'classes':
        return <ClassBooking />
      case 'training':
        return <PTBooking />
      case 'visits':
        return <VisitHistory />
      case 'logs':
        return <WorkoutLog />
      default:
        return <SupportForm />
    }
  }

  return (
    <div className="bg-[#1a1b23] text-white h-screen flex">
      <MemberSidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-800 p-8">
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
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
} 