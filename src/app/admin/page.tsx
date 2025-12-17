"use client";

import { useState, useEffect, FormEvent } from "react";

/**
 * Admin Dashboard - Simple statistics and contact message viewer
 *
 * Login credentials: admin / admin (hardcoded, no security needed per user request)
 *
 * Features:
 * - View all contact form submissions
 * - Basic visitor tracking (using localStorage for unique visitors)
 * - Page view counter
 *
 * NOTE: This is a simple admin panel with NO real security.
 * For production use, implement proper authentication.
 */

interface ContactEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  source: string;
}

interface VisitorStats {
  totalPageViews: number;
  uniqueVisitors: number;
  todayPageViews: number;
  lastUpdated: string;
}

// Track page view on client side
function trackPageView() {
  if (typeof window === "undefined") return;

  try {
    const statsKey = "sajtstudio_visitor_stats";
    const visitorIdKey = "sajtstudio_visitor_id";
    const today = new Date().toISOString().split("T")[0];

    // Get or create visitor ID
    let visitorId = localStorage.getItem(visitorIdKey);
    const isNewVisitor = !visitorId;
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      localStorage.setItem(visitorIdKey, visitorId);
    }

    // Get current stats
    const statsJson = localStorage.getItem(statsKey);
    let stats: VisitorStats = statsJson
      ? JSON.parse(statsJson)
      : {
          totalPageViews: 0,
          uniqueVisitors: 0,
          todayPageViews: 0,
          lastUpdated: today,
        };

    // Reset today's count if it's a new day
    if (stats.lastUpdated !== today) {
      stats.todayPageViews = 0;
      stats.lastUpdated = today;
    }

    // Update stats
    stats.totalPageViews += 1;
    stats.todayPageViews += 1;
    if (isNewVisitor) {
      stats.uniqueVisitors += 1;
    }

    localStorage.setItem(statsKey, JSON.stringify(stats));
  } catch {
    // Ignore localStorage errors
  }
}

// Get visitor stats
function getVisitorStats(): VisitorStats {
  if (typeof window === "undefined") {
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      todayPageViews: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
  }

  try {
    const statsKey = "sajtstudio_visitor_stats";
    const statsJson = localStorage.getItem(statsKey);
    return statsJson
      ? JSON.parse(statsJson)
      : {
          totalPageViews: 0,
          uniqueVisitors: 0,
          todayPageViews: 0,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
  } catch {
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      todayPageViews: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
  }
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track page view on mount
  useEffect(() => {
    trackPageView();
  }, []);

  // Hardcoded login - admin/admin (no security per user request)
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
      // Load data after login
      loadData();
    } else {
      setLoginError("Felaktigt användarnamn eller lösenord");
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    // Load visitor stats from localStorage
    setStats(getVisitorStats());

    // Load contacts from API
    try {
      const response = await fetch("/api/contact", {
        headers: {
          // If CONTACTS_API_KEY is set, this will fail without it
          // For now, we just try without auth
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      } else if (response.status === 401) {
        setError("API-nyckel krävs för att hämta kontakter");
      } else {
        setError("Kunde inte hämta kontakter");
      }
    } catch {
      setError("Nätverksfel vid hämtning av kontakter");
    }

    setLoading(false);
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Admin
          </h1>
          <p className="text-gray-400 text-center mb-8">Sajtstudio Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Användarnamn
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Lösenord
              </label>
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
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">
              Sajtstudio statistik och meddelanden
            </p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logga ut
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Sidvisningar totalt
            </p>
            <p className="text-4xl font-bold text-white">
              {stats?.totalPageViews || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Unika besökare
            </p>
            <p className="text-4xl font-bold text-blue-400">
              {stats?.uniqueVisitors || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Sidvisningar idag
            </p>
            <p className="text-4xl font-bold text-green-400">
              {stats?.todayPageViews || 0}
            </p>
          </div>
        </div>

        {/* Contacts section */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Kontaktmeddelanden</h2>
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? "Laddar..." : "Uppdatera"}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {contacts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Inga meddelanden än
            </p>
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
                        {new Date(contact.timestamp).toLocaleDateString(
                          "sv-SE"
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(contact.timestamp).toLocaleTimeString(
                          "sv-SE"
                        )}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded">
                        {contact.source}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {contact.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <p className="text-gray-500 text-sm mt-4 text-center">
          Besökarstatistik lagras lokalt i webbläsaren. Kontaktmeddelanden
          hämtas från servern.
        </p>
      </div>
    </div>
  );
}
