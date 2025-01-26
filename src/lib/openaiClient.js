import OpenAI from 'openai'

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
})

export const generateTicketResponse = async (ticket) => {
  const prompt = `Please write a professional and helpful response to this support ticket. Write the response as if you are directly replying to the customer's email - do not include any subject line or email headers, just the message body:

Title: ${ticket.title}
Customer Name: ${ticket.memberName}
Customer Request: ${ticket.description}
Agent Name: ${ticket.agentName}
Agent Position: ${ticket.agentPosition}

Write a response that is:
1. Professional and courteous
2. Directly addresses the customer's request
3. Clear and concise
4. Helpful and solution-oriented
5. Start with "Hi ${ticket.memberName}" if a name is provided (use the first name if possible), otherwise use an appropriate greeting
6. End with a professional signature using the agent's name and position:

Best regards,
[Agent Name - use first name if possible]
GymDesk Team`

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

export default openai 