import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface TicketData {
  title: string
  description: string
  priority: string
  created_by: string
  status: string
  member_email: string
  type?: 'notification' | 'reply'  // New field to differentiate between notification and reply
  reply_text?: string             // New field for agent replies
}

// Function to generate email content based on type
const getEmailContent = (ticket: TicketData) => {
  if (ticket.type === 'reply') {
    return {
      subject: `Re: ${ticket.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Response to Your Support Ticket</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #555;">${ticket.reply_text}</p>
          </div>
          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p style="color: #666; font-size: 14px;"><strong>Original Request:</strong></p>
            <p style="color: #666; font-size: 14px;">${ticket.description}</p>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #999;">
            <p>Ticket #${ticket.title} • Priority: ${ticket.priority}</p>
          </div>
        </div>
      `
    }
  }

  // Default notification template (existing functionality)
  return {
    subject: `New Support Ticket: ${ticket.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Support Ticket</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Status:</strong> ${ticket.status}</p>
          <p><strong>Member Email:</strong> ${ticket.member_email}</p>
          <p><strong>Description:</strong></p>
          <p>${ticket.description}</p>
        </div>
      </div>
    `
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ticket: TicketData = await req.json()
    
    // Get email content based on type
    const emailContent = getEmailContent(ticket)
    
    // Determine the recipient based on the type
    const recipient = ticket.type === 'reply' ? ticket.member_email : 'malekai.mischke@gauntletai.com'
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: recipient,
        subject: emailContent.subject,
        html: emailContent.html
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 