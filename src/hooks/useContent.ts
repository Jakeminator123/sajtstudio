/**
 * Content Hook - Client-side hook for fetching CMS content
 * 
 * Usage in components:
 * const { content, isLoading } = useContent("T1");
 * const { contentMap, isLoading } = useContentSection("hero");
 * 
 * For server components, use getContentValue from content-database.ts directly
 */

import { useEffect, useState, useCallback, useMemo } from "react";

// Content entry type (matches database)
export interface ContentEntry {
  id: number;
  key: string;
  type: "text" | "image" | "video";
  section: string;
  value: string;
  label: string;
  updated_at: string;
}

// Cache for content to avoid repeated API calls within a session
// Cache is cleared on each full page load (module initialization) to ensure CMS updates are visible after refresh
const contentCache: Map<string, ContentEntry> = new Map();
const sectionCache: Map<string, ContentEntry[]> = new Map();
let allContentCache: ContentEntry[] | null = null;

// Clear cache on each full page load (browser refresh / direct navigation).
// This module is only initialized on full page loads, not during Next.js SPA navigation,
// so it's safe to clear caches unconditionally here.
if (typeof window !== "undefined") {
  contentCache.clear();
  sectionCache.clear();
  allContentCache = null;

  // Track this load in sessionStorage for debugging/visibility
  sessionStorage.setItem("content_page_load_id", Date.now().toString());
}

/**
 * Hook to get a single content value by key
 */
export function useContent(key: string, fallback?: string) {
  const [content, setContent] = useState<ContentEntry | null>(
    contentCache.get(key) || null
  );
  const [isLoading, setIsLoading] = useState(!contentCache.has(key));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If cached, use cached value
    if (contentCache.has(key)) {
      setContent(contentCache.get(key) || null);
      setIsLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/content?key=${encodeURIComponent(key)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${key}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.content) {
          contentCache.set(key, data.content);
          setContent(data.content);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [key]);

  return {
    content,
    value: content?.value ?? fallback ?? "",
    isLoading,
    error,
  };
}

/**
 * Hook to get all content for a section
 */
export function useContentSection(section: string) {
  const [content, setContent] = useState<ContentEntry[]>(
    sectionCache.get(section) || []
  );
  const [isLoading, setIsLoading] = useState(!sectionCache.has(section));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If cached, use cached value
    if (sectionCache.has(section)) {
      setContent(sectionCache.get(section) || []);
      setIsLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/content?section=${encodeURIComponent(section)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch section: ${section}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.content) {
          sectionCache.set(section, data.content);
          setContent(data.content);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [section]);

  // Create a map for easy access by key (memoized to keep stable references)
  const contentMap = useMemo(() => {
    return content.reduce((acc, entry) => {
      acc[entry.key] = entry.value;
      return acc;
    }, {} as Record<string, string>);
  }, [content]);

  // Stable accessor (prevents downstream useMemo dependencies from re-running each render)
  const getValue = useCallback(
    (key: string, fallback?: string) => contentMap[key] ?? fallback ?? "",
    [contentMap]
  );

  return {
    content,
    contentMap,
    isLoading,
    error,
    getValue,
  };
}

/**
 * Hook to get all content (for admin panel)
 */
export function useAllContent() {
  const [content, setContent] = useState<ContentEntry[]>(allContentCache || []);
  const [isLoading, setIsLoading] = useState(!allContentCache);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/content");
      
      if (!response.ok) {
        throw new Error("Failed to fetch all content");
      }
      
      const data = await response.json();
      
      if (data.success && data.content) {
        allContentCache = data.content;
        setContent(data.content);
        
        // Also update individual caches
        for (const entry of data.content) {
          contentCache.set(entry.key, entry);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allContentCache) {
      refresh();
    }
  }, [refresh]);

  return {
    content,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for updating content (admin use)
 */
export function useContentUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateContent = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // API key from public env var (if set)
          ...(process.env.NEXT_PUBLIC_CONTENT_API_KEY && {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENT_API_KEY}`,
          }),
        },
        body: JSON.stringify({ key, value }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update content");
      }
      
      const data = await response.json();
      
      if (data.success && data.content) {
        // Update caches
        contentCache.set(key, data.content);
        allContentCache = null; // Invalidate all content cache
        sectionCache.delete(data.content.section); // Invalidate section cache
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const seedDefaults = useCallback(async (): Promise<number> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_CONTENT_API_KEY && {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONTENT_API_KEY}`,
          }),
        },
        body: JSON.stringify({ action: "seed" }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to seed defaults");
      }
      
      const data = await response.json();
      
      // Clear all caches
      contentCache.clear();
      sectionCache.clear();
      allContentCache = null;
      
      return data.inserted || 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return 0;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateContent,
    seedDefaults,
    isUpdating,
    error,
  };
}

/**
 * Clear all content caches (useful after admin updates)
 */
export function clearContentCache() {
  contentCache.clear();
  sectionCache.clear();
  allContentCache = null;
}

