'use client'

import { useState, type FormEvent } from 'react'

type Props = {
  slug: string
  title?: string
}

export default function EmbedPasswordGate({ slug, title }: Props) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`/api/embed-auth/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setError(data.error || 'Ogiltigt lösenord')
        setLoading(false)
        return
      }

      // Cookie is now set (HttpOnly). Reload to render the iframe.
      window.location.reload()
    } catch {
      setError('Något gick fel. Försök igen.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center">
          {title ? `${title}` : 'Skyddad sida'}
        </h1>
        <p className="text-white/70 text-center mt-2">Ange lösenordet för att fortsätta.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="embed-password"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Lösenord
            </label>
            <input
              id="embed-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="off"
              className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full rounded-lg bg-gradient-to-r from-accent to-tertiary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 disabled:opacity-40"
          >
            {loading ? 'Verifierar…' : 'Fortsätt'}
          </button>
        </form>
      </div>
    </main>
  )
}
