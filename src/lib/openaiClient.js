import OpenAI from 'openai'

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
})

export default openai 