import { useState, useEffect, useRef } from 'react'
import { EllipsisVerticalIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { sendTicketNotification } from '../../lib/supabaseClient'
import EmojiPicker from 'emoji-picker-react'

export default function TicketDetail({ ticket, onClose }) {
  const [replyText, setReplyText] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [solving, setSolving] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showHeaderStatusMenu, setShowHeaderStatusMenu] = useState(false)
  const emojiButtonRef = useRef(null)
  const statusButtonRef = useRef(null)
  const headerStatusRef = useRef(null)
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 })

  // Debug log to see ticket data
  useEffect(() => {
    console.log('Ticket Data:', ticket)
  }, [ticket])

  // Reset messages when ticket changes
  useEffect(() => {
    setMessages([
      {
        id: ticket.id,
        text: ticket.description,
        sender: 'customer',
        timestamp: ticket.created_at
      }
    ])
  }, [ticket.id, ticket.description, ticket.created_at])

  // Calculate picker position when showing
  useEffect(() => {
    if (showEmojiPicker && emojiButtonRef.current) {
      const buttonRect = emojiButtonRef.current.getBoundingClientRect()
      const middleSection = emojiButtonRef.current.closest('.flex-1.flex.flex-col')
      const middleRect = middleSection.getBoundingClientRect()
      
      // Position above the button
      let top = buttonRect.top - 440 // 440px is approximate height of emoji picker
      let left = Math.min(
        buttonRect.left,
        middleRect.right - 352 // 352px is approximate width of emoji picker
      )
      
      // Ensure picker stays within middle section
      left = Math.max(middleRect.left, left)
      
      setPickerPosition({ top, left })
    }
  }, [showEmojiPicker])

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    
    setSending(true)
    try {
      console.log('=== Starting Reply Submission ===')
      console.log('Original ticket data:', ticket) // Log the original ticket data
      
      // Create the new message object
      const newMessage = {
        id: Date.now(),
        text: replyText,
        sender: 'agent',
        timestamp: new Date().toISOString()
      }

      // Prepare ticket data with all required fields
      const ticketData = {
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        created_by: ticket.created_by,
        member_email: ticket.member_email, // Make sure this exists in the ticket prop
        type: 'reply',
        reply_text: replyText
      }
      
      // Verify all required fields are present
      console.log('Sending reply with data:', JSON.stringify(ticketData, null, 2))
      
      if (!ticketData.member_email) {
        throw new Error('Member email is missing from the ticket data')
      }

      // Send the reply via Edge Function
      const { data, error: emailError } = await sendTicketNotification(ticketData)

      if (emailError) {
        console.error('Email Error Details:', emailError)
        throw new Error(emailError.message || 'Failed to send email')
      }

      console.log('Reply sent successfully:', data)

      // Update messages in the UI
      setMessages(prev => [...prev, newMessage])
      
      // Clear the reply text
      setReplyText('')
      
      // Show success message
      toast.success('Reply sent successfully')
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error(error.message || 'Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    console.log('=== Starting Status Change ===')
    console.log('Ticket ID being updated:', ticket.id)
    console.log('Current status:', ticket.status)
    console.log('New status:', newStatus)
    
    setSolving(true)
    try {
      console.log('Making Supabase update call...')
      // First verify the ticket exists
      const { data: checkData, error: checkError } = await supabase
        .from('tickets')
        .select('status')
        .eq('id', ticket.id)
        .single()
      
      console.log('Current ticket in DB:', checkData)

      if (checkError) {
        console.error('Error checking ticket:', checkError)
        throw checkError
      }

      // Then make the update
      const { data, error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id)
        .select()

      console.log('Supabase update response:', { data, error })

      if (error) throw error
      
      if (data && data[0]) {
        // Update the local ticket state with the new status
        ticket.status = newStatus
        console.log('Local ticket updated:', ticket)
        toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`)
      } else {
        throw new Error('No data returned from update')
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
      toast.error('Failed to update ticket status')
    } finally {
      setSolving(false)
      setShowStatusMenu(false)
      setShowHeaderStatusMenu(false)
    }
  }

  const onEmojiClick = (emojiObject) => {
    const cursor = document.querySelector('textarea').selectionStart
    const text = replyText.slice(0, cursor) + emojiObject.emoji + replyText.slice(cursor)
    setReplyText(text)
    setShowEmojiPicker(false)
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  // Close status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusMenu && !event.target.closest('.status-menu-container')) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showStatusMenu])

  // Close header status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHeaderStatusMenu && !event.target.closest('.header-status-container')) {
        setShowHeaderStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showHeaderStatusMenu])

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-white">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 mr-2">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3 flex-1">
          <h1 className="text-lg font-medium text-gray-900">{ticket.title}</h1>
          <div className="relative header-status-container">
            <button
              ref={headerStatusRef}
              onClick={() => setShowHeaderStatusMenu(!showHeaderStatusMenu)}
              className={`px-2 py-1 text-sm rounded-full uppercase font-medium inline-flex items-center space-x-1 ${
                ticket.status === 'open' ? 'bg-green-100 text-green-800' : 
                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                ticket.status === 'solved' ? 'bg-blue-100 text-blue-800' :
                ticket.status === 'closed' ? 'bg-gray-600 text-white' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              <span>{ticket.status.replace('_', ' ')}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHeaderStatusMenu && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu">
                  {['solved', 'closed', 'open', 'in_progress'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusChange(status)
                        setShowHeaderStatusMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                      role="menuitem"
                    >
                      Mark as {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-500">
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 bg-gray-50 w-full overflow-hidden">
        {/* Conversation thread and reply box container */}
        <div className="flex-1 flex flex-col max-h-screen">
          {/* Conversation thread */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <div className="max-w-4xl mx-auto">
              {messages.map(message => (
                <div key={message.id} className="flex space-x-3 pl-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {message.sender === 'customer' 
                          ? (ticket.first_name?.[0]?.toUpperCase() || 'M')
                          : 'A'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-900">
                        {message.sender === 'customer' 
                          ? `${ticket.first_name || ''} ${ticket.last_name || ''}`.trim() || 'Member'
                          : 'Agent'
                        }
                      </span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-gray-500">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply box */}
          <div className="bg-white border-t border-gray-200 flex-shrink-0">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center space-x-2 py-3 text-sm text-gray-600 px-4">
                <span className="flex items-center">
                  <span className="text-gray-500">To</span>
                  <div className="ml-2 flex items-center bg-gray-100 rounded-full px-2 py-1">
                    <span className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 mr-1">
                      {ticket.member_email?.[0]?.toUpperCase() || 'C'}
                    </span>
                    <span>{ticket.member_email || 'Customer'}</span>
                  </div>
                </span>
                <button className="text-blue-600 text-sm hover:text-blue-700">
                  BCC
                </button>
              </div>
              <div className="border-t border-gray-200">
                <div className="flex flex-col">
                  <textarea
                    rows={6}
                    className="block w-full px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none text-sm resize-none border-0"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ height: '150px' }}
                  />
                  <div className="flex items-center justify-between py-3 px-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button className="p-2 text-gray-500 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                      <div className="relative emoji-picker-container">
                        <button 
                          ref={emojiButtonRef}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 text-gray-500 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        {showEmojiPicker && (
                          <div className="fixed" style={{
                            top: pickerPosition.top,
                            left: pickerPosition.left,
                            zIndex: 50
                          }}>
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      
                      <div className="relative status-menu-container">
                        <button
                          ref={statusButtonRef}
                          onClick={() => setShowStatusMenu(!showStatusMenu)}
                          disabled={solving}
                          className={`px-4 py-2 text-sm font-medium inline-flex items-center shadow-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            ticket.status === 'open' ? 'text-green-700 bg-green-50 border border-green-300 hover:bg-green-100 focus:ring-green-500' :
                            ticket.status === 'in_progress' ? 'text-yellow-700 bg-yellow-50 border border-yellow-300 hover:bg-yellow-100 focus:ring-yellow-500' :
                            ticket.status === 'solved' ? 'text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100 focus:ring-blue-500' :
                            ticket.status === 'closed' ? 'text-gray-700 bg-gray-50 border border-gray-300 hover:bg-gray-100 focus:ring-gray-500' :
                            'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500'
                          }`}
                        >
                          <span>Status: {ticket.status
                            .replace('_', ' ')
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                          </span>
                          <svg className="w-4 h-4 ml-1.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showStatusMenu && (
                          <div className="absolute right-0 bottom-full mb-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                            <div className="py-1" role="menu">
                              {['solved', 'closed', 'open', 'in_progress'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(status)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                                  role="menuitem"
                                >
                                  Mark as {status.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        onClick={handleSubmitReply}
                        disabled={sending}
                        className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          sending ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {sending ? 'Sending...' : 'Send Email'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Member</h3>
                <div className="mt-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {ticket.first_name?.[0]?.toUpperCase() || 'M'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {`${ticket.first_name || ''} ${ticket.last_name || ''}`.trim() || 'Member'}
                      </p>
                      <p className="text-sm text-gray-500">{ticket.member_email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Properties */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Properties</h3>
                <dl className="mt-2 divide-y divide-gray-200">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900">{ticket.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Priority</dt>
                    <dd className="text-sm text-gray-900">{ticket.priority}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Ticket ID */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Ticket ID</h3>
                <div className="mt-2 bg-gray-50 rounded-md p-3">
                  <p className="text-sm font-mono text-gray-900">#{ticket.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 