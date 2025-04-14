'use client';

import { useState } from 'react';

export default function MorpheusChat() {
  const [messages, setMessages] = useState([
    { role: 'morpheus', text: 'I am Morpheus, Lord of Dreams. What topic stirs your curiosity today?' }
  ])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(0)
  const [conversation, setConversation] = useState({ topic: '', context: '', audience: '', goal: '' })

  const steps = [
    'context',
    'audience',
    'goal',
  ]

  const prompts = {
    context: 'What background or context should I know?',
    audience: 'Who is this for?',
    goal: 'What is your goal or desired outcome?'
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', text: input }]

    if (step === 0) {
      setConversation(prev => ({ ...prev, topic: input }))
      newMessages.push({ role: 'morpheus', text: prompts.context })
    } else if (step === 1) {
      setConversation(prev => ({ ...prev, context: input }))
      newMessages.push({ role: 'morpheus', text: prompts.audience })
    } else if (step === 2) {
      setConversation(prev => ({ ...prev, audience: input }))
      newMessages.push({ role: 'morpheus', text: prompts.goal })
    } else if (step === 3) {
      setConversation(prev => ({ ...prev, goal: input }))
      newMessages.push({ role: 'morpheus', text: 'Thank you. The dream shall now begin...' })

      // Send to backend
      await fetch('/api/morpheus/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation)
      })

      // Optionally: redirect to /dreaming or show loading
    }

    setMessages(newMessages)
    setInput('')
    setStep(step + 1)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-xl p-4 mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`text-${msg.role === 'morpheus' ? 'purple-400' : 'white'} whitespace-pre-wrap`}>
            <strong>{msg.role === 'morpheus' ? 'Morpheus' : 'You'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="w-full max-w-2xl flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-grow rounded-lg bg-zinc-800 border border-purple-500 p-3 text-white focus:outline-none"
          placeholder="Your reply..."
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  )
}
