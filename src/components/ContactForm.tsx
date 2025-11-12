"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface FormState {
  name: string;
  email: string;
  message: string;
  status: "idle" | "sending" | "success" | "error";
}

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    message: "",
    status: "idle",
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    setFormState((prev) => ({ ...prev, status: "sending" }));

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          message: formState.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      // Success - reset form and show success message
      setFormState({
        name: "",
        email: "",
        message: "",
        status: "success",
      });

      // Reset success message after 5 seconds
      successTimeoutRef.current = setTimeout(() => {
        setFormState((prev) => ({ ...prev, status: "idle" }));
      }, 5000);
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        status: "error",
      }));

      // Reset error message after 5 seconds
      successTimeoutRef.current = setTimeout(() => {
        setFormState((prev) => ({ ...prev, status: "idle" }));
      }, 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Namn
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formState.name}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
          required
          disabled={formState.status === "sending"}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          E-post
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formState.email}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors"
          required
          disabled={formState.status === "sending"}
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Meddelande
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={formState.message}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, message: e.target.value }))
          }
          className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors resize-none"
          required
          disabled={formState.status === "sending"}
        />
      </div>

      {formState.status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 text-green-800 rounded"
        >
          Tack för ditt meddelande! Vi återkommer så snart som möjligt.
        </motion.div>
      )}

      {formState.status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 text-red-800 rounded"
        >
          Något gick fel. Försök igen senare.
        </motion.div>
      )}

      <button
        type="submit"
        disabled={formState.status === "sending"}
        className="w-full px-8 py-4 bg-black text-white font-semibold hover:bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-busy={formState.status === "sending"}
        aria-live="polite"
      >
        {formState.status === "sending" ? "Skickar..." : "Skicka"}
      </button>
    </form>
  );
}
