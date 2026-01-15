'use client'

import { useState, FormEvent, useCallback } from 'react'
import Link from 'next/link'

/**
 * Admin Dashboard - Statistics, contact messages, and content management
 *
 * Features:
 * - View all contact form submissions
 * - Basic visitor tracking (using localStorage for unique visitors)
 * - Page view counter
 * - Content management (T1-T51, B1-B15, V1-V6 keys)
 *
 * Login:
 * - Uses NEXT_PUBLIC_ADMIN_USERNAME and NEXT_PUBLIC_ADMIN_PASSWORD
 * - Falls back to admin/admin if env vars are not set
 *
 * API Keys:
 * - NEXT_PUBLIC_CONTACTS_API_KEY - for fetching contacts
 * - NEXT_PUBLIC_CONTENT_API_KEY - for updating content
 */

interface ContactEntry {
  id: string
  name: string
  email: string
  message: string
  timestamp: string
  source: string
}

interface ContentEntry {
  id: number
  key: string
  type: 'text' | 'image' | 'video'
  section: string
  value: string
  label: string
  updated_at: string
}

interface VisitorStats {
  totalPageViews: number
  uniqueVisitors: number
  uniqueIpVisitors: number
  todayPageViews: number
  lastUpdated: string
  recentIpHashes?: { hash: string; lastSeen: string; prefix: string | null }[]
}

type TabType = 'overview' | 'contacts' | 'content' | 'audits'

interface SavedAudit {
  id: string
  filename: string
  domain: string | null
  company: string | null
  type: 'audit' | 'recommendation'
  timestamp: string
  scores: {
    seo?: number
    ux?: number
    performance?: number
    overall?: number
  }
  cost: {
    sek: number
    tokens: number
  }
}

// Get admin credentials from env or fallback to defaults
function getAdminCredentials() {
  // Default to admin/admin if env vars not set (for development convenience)
  // In production, set NEXT_PUBLIC_ADMIN_USERNAME and NEXT_PUBLIC_ADMIN_PASSWORD
  return {
    username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin',
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin',
  }
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [contacts, setContacts] = useState<ContactEntry[]>([])
  const [content, setContent] = useState<ContentEntry[]>([])
  const [stats, setStats] = useState<VisitorStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [contentFilter, setContentFilter] = useState<string>('all')
  const [audits, setAudits] = useState<SavedAudit[]>([])
  const [auditsLoading, setAuditsLoading] = useState(false)

  // Login handler with env-based credentials
  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    const creds = getAdminCredentials()

    if (!creds.username || !creds.password) {
      setLoginError(
        'Admin credentials not configured. Set NEXT_PUBLIC_ADMIN_USERNAME and NEXT_PUBLIC_ADMIN_PASSWORD.'
      )
      return
    }

    if (username === creds.username && password === creds.password) {
      setIsLoggedIn(true)
      setLoginError('')
      loadData()
    } else {
      setLoginError('Felaktigt användarnamn eller lösenord')
    }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    // Load visitor stats from database
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || null)
      }
    } catch {
      // Stats errors don't block the dashboard
    }

    // Load contacts
    try {
      const apiKey = process.env.NEXT_PUBLIC_CONTACTS_API_KEY
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch('/api/contact', { headers })
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      } else if (response.status === 401) {
        setError('API-nyckel krävs för att hämta kontakter')
      }
    } catch {
      setError('Nätverksfel vid hämtning av kontakter')
    }

    // Load content
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data.content || [])
      }
    } catch {
      console.error('Failed to load content')
    }

    // Load audits
    try {
      const response = await fetch('/api/audits')
      if (response.ok) {
        const data = await response.json()
        setAudits(data.audits || [])
      }
    } catch {
      console.error('Failed to load audits')
    }

    setLoading(false)
  }, [])

  const loadAudits = async () => {
    setAuditsLoading(true)
    try {
      const response = await fetch('/api/audits')
      if (response.ok) {
        const data = await response.json()
        setAudits(data.audits || [])
      }
    } catch {
      console.error('Failed to load audits')
    }
    setAuditsLoading(false)
  }

  const handleDeleteAudit = async (id: string) => {
    if (!confirm('Är du säker på att du vill radera denna audit?')) return

    try {
      const response = await fetch('/api/audits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setAudits((prev) => prev.filter((a) => a.id !== id))
      }
    } catch {
      console.error('Failed to delete audit')
    }
  }

  const handleEditContent = (entry: ContentEntry) => {
    setEditingKey(entry.key)
    setEditValue(entry.value)
    setSaveStatus('idle')
  }

  const handleSaveContent = async () => {
    if (!editingKey) return

    setSaveStatus('saving')
    try {
      const apiKey = process.env.NEXT_PUBLIC_CONTENT_API_KEY
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch('/api/content', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ key: editingKey, value: editValue }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update local state
        setContent((prev) =>
          prev.map((c) =>
            c.key === editingKey
              ? { ...c, value: editValue, updated_at: data.content.updated_at }
              : c
          )
        )
        setSaveStatus('saved')
        setTimeout(() => {
          setEditingKey(null)
          setSaveStatus('idle')
        }, 1500)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }

  const handleSeedDefaults = async () => {
    if (!confirm('Vill du fylla i standardvärden för allt innehåll som saknas?')) return

    try {
      const apiKey = process.env.NEXT_PUBLIC_CONTENT_API_KEY
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch('/api/content', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'seed' }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`${data.inserted} standardvärden tillagda!`)
        loadData()
      }
    } catch {
      alert('Kunde inte fylla i standardvärden')
    }
  }

  // Get unique sections for filter
  const sections = Array.from(new Set(content.map((c) => c.section))).sort()
  const filteredContent =
    contentFilter === 'all' ? content : content.filter((c) => c.section === contentFilter)

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin</h1>
          <p className="text-gray-400 text-center mb-8">Sajtstudio Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Användarnamn</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Lösenord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Logga in
            </button>
          </form>

          <p className="text-gray-500 text-xs mt-4 text-center">Dev default: admin / admin</p>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Sajtstudio statistik, meddelanden och innehåll</p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logga ut
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'contacts', 'content', 'audits'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'overview' && 'Översikt'}
              {tab === 'contacts' && `Meddelanden (${contacts.length})`}
              {tab === 'content' && `Innehåll (${content.length})`}
              {tab === 'audits' && `Audits (${audits.length})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                  Sidvisningar totalt
                </p>
                <p className="text-4xl font-bold text-white">{stats?.totalPageViews || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                  Unika besökare
                </p>
                <p className="text-4xl font-bold text-blue-400">{stats?.uniqueVisitors || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                  Unika IP (hashade)
                </p>
                <p className="text-4xl font-bold text-amber-400">{stats?.uniqueIpVisitors ?? 0}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                  Sidvisningar idag
                </p>
                <p className="text-4xl font-bold text-green-400">{stats?.todayPageViews || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Senaste meddelanden</h3>
                {contacts.slice(0, 3).map((contact) => (
                  <div
                    key={contact.id}
                    className="mb-3 pb-3 border-b border-gray-700 last:border-0"
                  >
                    <p className="text-white font-medium">{contact.name}</p>
                    <p className="text-gray-400 text-sm truncate">{contact.message}</p>
                  </div>
                ))}
                {contacts.length === 0 && <p className="text-gray-500">Inga meddelanden än</p>}
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Innehållsstatus</h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div key={section} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{section}</span>
                      <span className="text-white">
                        {content.filter((c) => c.section === section).length} poster
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Senaste IP-hashar</h3>
                <p className="text-gray-500 text-sm mb-3">
                  Maskerade värden för senaste besökare. Prefix visar nät (ingen rå IP).
                </p>
                {stats?.recentIpHashes && stats.recentIpHashes.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentIpHashes.map((ip) => {
                      const hashLabel = `${ip.hash.slice(0, 12)}${ip.hash.length > 12 ? '…' : ''}`
                      const prefixLabel = ip.prefix ? ip.prefix : 'okänt nät'
                      const dateLabel = `${new Date(ip.lastSeen).toLocaleDateString('sv-SE')} ${new Date(
                        ip.lastSeen
                      ).toLocaleTimeString('sv-SE')}`
                      return (
                        <div key={ip.hash} className="flex justify-between text-sm">
                          <div className="flex flex-col">
                            <span className="text-blue-300 font-mono">{hashLabel}</span>
                            <span className="text-gray-400 text-xs">{prefixLabel}</span>
                          </div>
                          <span className="text-gray-400">{dateLabel}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Ingen IP-data än</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Kontaktmeddelanden</h2>
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Laddar...' : 'Uppdatera'}
              </button>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {contacts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Inga meddelanden än</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-semibold">{contact.name}</p>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {contact.email}
                        </a>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">
                          {new Date(contact.timestamp).toLocaleDateString('sv-SE')}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(contact.timestamp).toLocaleTimeString('sv-SE')}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded">
                          {contact.source || 'website'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{contact.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-bold text-white">Innehållshantering</h2>
              <div className="flex gap-2">
                <select
                  value={contentFilter}
                  onChange={(e) => setContentFilter(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
                >
                  <option value="all">Alla sektioner</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSeedDefaults}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Fyll standardvärden
                </button>
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Laddar...' : 'Uppdatera'}
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Klicka på en rad för att redigera. Nycklar: T* = text, B* = bild, V* = video.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-3 text-gray-400 font-medium w-20">Nyckel</th>
                    <th className="pb-3 text-gray-400 font-medium w-24">Typ</th>
                    <th className="pb-3 text-gray-400 font-medium w-28">Sektion</th>
                    <th className="pb-3 text-gray-400 font-medium">Beskrivning</th>
                    <th className="pb-3 text-gray-400 font-medium">Värde</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((entry) => (
                    <tr
                      key={entry.key}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors ${
                        editingKey === entry.key ? 'bg-gray-700/50' : ''
                      }`}
                      onClick={() => handleEditContent(entry)}
                    >
                      <td className="py-3 font-mono text-blue-400">{entry.key}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            entry.type === 'text'
                              ? 'bg-blue-900/50 text-blue-300'
                              : entry.type === 'image'
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-purple-900/50 text-purple-300'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 capitalize">{entry.section}</td>
                      <td className="py-3 text-gray-300">{entry.label}</td>
                      <td className="py-3 text-white max-w-xs truncate">{entry.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Modal */}
            {editingKey && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-white mb-4">Redigera {editingKey}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {content.find((c) => c.key === editingKey)?.label}
                  </p>

                  {content.find((c) => c.key === editingKey)?.type === 'text' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none min-h-[150px]"
                      placeholder="Ange värde..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="/path/to/file"
                    />
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setEditingKey(null)
                        setSaveStatus('idle')
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleSaveContent}
                      disabled={saveStatus === 'saving'}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        saveStatus === 'saved'
                          ? 'bg-green-600 text-white'
                          : saveStatus === 'error'
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {saveStatus === 'saving'
                        ? 'Sparar...'
                        : saveStatus === 'saved'
                          ? 'Sparat!'
                          : saveStatus === 'error'
                            ? 'Fel!'
                            : 'Spara'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audits Tab */}
        {activeTab === 'audits' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">📊 Sparade Audits</h2>
              <button
                onClick={loadAudits}
                disabled={auditsLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {auditsLoading ? 'Laddar...' : '🔄 Uppdatera'}
              </button>
            </div>

            {audits.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Inga sparade audits ännu. Kör en audit på{' '}
                <Link href="/utvardera" className="text-blue-400 hover:underline">
                  /utvardera
                </Link>{' '}
                för att komma igång.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{audits.length}</p>
                    <p className="text-gray-400 text-sm">Totalt</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {audits.filter((a) => a.type === 'audit').length}
                    </p>
                    <p className="text-gray-400 text-sm">Webbaudits</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      {audits.filter((a) => a.type === 'recommendation').length}
                    </p>
                    <p className="text-gray-400 text-sm">Rekommendationer</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">
                      {audits.reduce((sum, a) => sum + (a.cost?.sek || 0), 0).toFixed(2)} kr
                    </p>
                    <p className="text-gray-400 text-sm">Total kostnad</p>
                  </div>
                </div>

                {/* Audits list */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-left border-b border-gray-700">
                        <th className="pb-3 font-medium">Typ</th>
                        <th className="pb-3 font-medium">Domän/Företag</th>
                        <th className="pb-3 font-medium">Datum</th>
                        <th className="pb-3 font-medium">Score</th>
                        <th className="pb-3 font-medium">Kostnad</th>
                        <th className="pb-3 font-medium">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {audits.map((audit) => (
                        <tr key={audit.id} className="hover:bg-gray-700/30">
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                audit.type === 'audit'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-purple-500/20 text-purple-400'
                              }`}
                            >
                              {audit.type === 'audit' ? '🔍 Audit' : '💡 Rekommen.'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-white">
                              {audit.domain || audit.company || '—'}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">
                            {new Date(audit.timestamp).toLocaleDateString('sv-SE')}
                          </td>
                          <td className="py-3">
                            {audit.scores?.overall !== undefined ? (
                              <span
                                className={`font-bold ${
                                  audit.scores.overall >= 70
                                    ? 'text-green-400'
                                    : audit.scores.overall >= 50
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                }`}
                              >
                                {audit.scores.overall}/100
                              </span>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="py-3 text-gray-400">
                            {audit.cost?.sek?.toFixed(2) || '0.00'} kr
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <a
                                href={`/audits/${audit.id}.json`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                                title="Visa JSON"
                              >
                                📄 JSON
                              </a>
                              <a
                                href={`/audits/${audit.id}.md`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                                title="Visa Markdown"
                              >
                                📝 MD
                              </a>
                              <button
                                onClick={() => handleDeleteAudit(audit.id)}
                                className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs transition-colors"
                                title="Radera"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="text-gray-500 text-sm mt-4 text-center">
          Besökarstatistik, kontaktmeddelanden, innehåll och audits hämtas från servern.
        </p>
      </div>
    </div>
  )
}
