'use client';

import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    topic: '',
    context: '',
    audience: '',
    goals: ''
  });

  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/morpheus/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      setResponse(data.message || 'Morpheus has spoken.');
    } catch (error) {
      console.error(error);
      setResponse('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-black text-white flex flex-col items-center justify-center">
      <h1 className="mb-8 text-3xl font-bold text-center">
        I am Morpheus, Lord of Dreams. Tell me the topic of your interest.
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
        {[
          { name: 'topic', label: 'Topic', placeholder: 'e.g. Cardano in Education' },
          { name: 'context', label: 'Context or background knowledge', placeholder: 'e.g. I want to teach this in college' },
          { name: 'audience', label: 'Who is this for?', placeholder: 'e.g. Educators, developers, community members' },
          { name: 'goals', label: 'What are your goals?', placeholder: 'e.g. Raise awareness, build curriculum, inform voters' }
        ].map(({ name, label, placeholder }) => (
          <div key={name}>
            <label htmlFor={name} className="block mb-1 font-medium">
              {label}
            </label>
            <input
              type="text"
              name={name}
              id={name}
              placeholder={placeholder}
              value={(form as any)[name]}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 text-white border border-purple-500 rounded-md placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          className="px-6 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 transition"
          disabled={loading}
        >
          {loading ? 'Summoning Morpheus...' : 'Submit'}
        </button>
      </form>

      {response && (
        <div className="mt-8 p-4 w-full max-w-xl text-sm whitespace-pre-wrap bg-gray-900 text-purple-100 border border-purple-600 rounded-md">
          <strong className="block text-purple-300 mb-2">Morpheus responds:</strong>
          {response}
        </div>
      )}
    </div>
  );
}
