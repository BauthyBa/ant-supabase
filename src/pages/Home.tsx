"use client"

import type React from "react"

import { type FC, useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from "../config"
import { SendHorizontal, LogOut, UserCircle, Bot, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const Home: FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isAISending, setIsAISending] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Function to fetch AI response
  const fetchAIResponse = async (prompt: string) => {
    setIsAISending(true)
    try {
      const functionUrl = `${VITE_SUPABASE_URL}/functions/v1/openai-chat`

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error processing your request. Please try again.")
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages((prev) => [...prev, { id: Date.now().toString() + "-ai", role: "assistant", content: data.reply }])
    } catch (error) {
      console.error("Error calling AI function:", error)
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred with the AI. Please try again."
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: errorMessage,
        },
      ])
    } finally {
      setIsAISending(false)
    }
  }

  // Effect for session management
  useEffect(() => {
    const checkSession = async () => {
      setLoadingSession(true)
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        navigate("/login")
        return
      }
      setUser(data.session.user)
      setLoadingSession(false)
    }
    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login")
      } else if (session) {
        setUser(session.user)
      } else {
        navigate("/login")
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [navigate])

  // Effect to scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Handle user logout
  const handleLogout = async () => {
    setIsAISending(true)
    const { error } = await supabase.auth.signOut()
    setIsAISending(false)
    if (error) {
      console.error("Error logging out:", error)
    }
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAISending) return

    const userMessage: Message = { id: Date.now().toString() + "-user", role: "user", content: inputMessage.trim() }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage.trim()
    setInputMessage("")

    await fetchAIResponse(currentInput)
  }

  // Handle Enter key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Loading screen while checking session
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="mt-4 text-white font-light">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="glass-container">
        {/* Header */}
        <div className="glass-header">
          <div className="glass-title">AI</div>
          <button onClick={handleLogout} className="glass-exit" disabled={isAISending} title="Exit">
            <LogOut size={22} />
          </button>
        </div>
        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.map((message) => (
            <div key={message.id} className="glass-message">
              {message.content}
            </div>
          ))}
          {isAISending && messages[messages.length - 1]?.role === "user" && (
            <div className="glass-message" style={{ opacity: 0.7 }}>
              Thinking...
            </div>
          )}
        </div>
        {/* Input */}
        <form className="glass-input-row" onSubmit={e => { e.preventDefault(); handleSendMessage(); }}>
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Send"
            className="glass-input"
            disabled={isAISending}
            autoFocus
          />
          <button type="submit" className="glass-send" disabled={isAISending || !inputMessage.trim()}
          >Send</button>
        </form>
      </div>
    </div>
  )
}

export default Home
