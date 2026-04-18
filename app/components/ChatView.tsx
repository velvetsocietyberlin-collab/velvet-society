'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: string
  role: 'bot' | 'user'
  content: string
  timestamp: number
  quickReplies?: string[]
}

const FAQ: Record<string, { answer: string; followUps?: string[] }> = {
  'Wie funktioniert ein Deal?': {
    answer: 'Velvet hat zwei Deal-Typen:\n\n• Direkt buchen — Klick, fertig, Code wird aktiviert. Meistens bei Restaurants, Events und Standard-Angeboten.\n\n• Anfrage stellen — die Brand prüft dein Profil und bestätigt. Oft in 1-3 Stunden, manchmal schneller. Bei hochwertigen Deals wie Auto-Loans oder exklusiven Events.\n\nWelcher Typ es ist, siehst du direkt auf der Deal-Karte.',
    followUps: ['Content-Missions erfüllen', 'Anfragen & Status'],
  },
  'Content-Missions erfüllen': {
    answer: 'Jeder Deal hat klare Missions — z.B. "1 Story mit @tag" oder "1 Reel min. 15s". Die Deadline steht im Deal-Detail.\n\nNach deinem Upload siehst du den Status unter "Meine Deals". Die Brand bestätigt den Content-Erhalt innerhalb von 48h.\n\nFragen zur Umsetzung? Schreib uns hier im Chat.',
    followUps: ['Wie funktioniert ein Deal?', 'Check-In Probleme'],
  },
  'Anfragen & Status': {
    answer: 'Deine Anfragen findest du unter "Meine Deals".\n\nStatus-Typen:\n• Angefragt — Brand prüft noch\n• Bestätigt — Deal ist deiner\n• Abgelehnt — leider kein Slot\n\nBestätigungen kommen meist in 1-3 Stunden. Abgelehnt? Wir zeigen den Grund transparent — oft einfach "keine Slots mehr".',
    followUps: ['Event-Einladungen', 'Check-In Probleme'],
  },
  'Event-Einladungen': {
    answer: 'Events sind mit einem [EVENT]-Badge markiert. Oft kannst du +1 mitbringen — das steht im Deal-Detail.\n\nDresscode, Start-Zeit und Location siehst du im Deal-Detail. Wichtig: pünktlich sein. Die Brand hat deinen Platz reserviert.',
    followUps: ['Check-In Probleme', 'Tier & Rating'],
  },
  'Check-In Probleme': {
    answer: 'QR-Code wird nicht gescannt?\n• Drück "Neu laden" in der Check-In-Tab — generiert einen frischen Code\n• Screen hell drehen, evtl. Code größer zoomen\n\nBrand findet deinen Code nicht? Zeig das Brand-Logo + deinen Namen am Empfang — die Brand hat deine Reservierung auf der Gäste-Liste.',
    followUps: ['Anfragen & Status', 'Content-Missions erfüllen'],
  },
  'Tier & Rating': {
    answer: 'Tier-Levels: Silver → Gold → Platinum.\n\nAufstieg basiert auf:\n• Abgeschlossene Deals\n• Content-Qualität\n• Brand-Bewertungen (1-5 Sterne)\n\nDein Rating sehen Brands bei deiner Anfrage — je höher, desto bessere Deal-Chancen.',
    followUps: ['Mein Profil', 'Wie funktioniert ein Deal?'],
  },
  'Mein Profil': {
    answer: 'Du kannst dein Profil jederzeit pausieren — dann bekommst du keine neuen Deal-Anfragen mehr.\n\nWillst du:\n• Profil pausieren oder reaktivieren\n• Handle/Name ändern\n• Account deaktivieren\n\n…dann schreib uns hier, wir kümmern uns drum.',
    followUps: ['Tier & Rating', 'Wie funktioniert ein Deal?'],
  },
}

const INITIAL_TOPICS = [
  'Wie funktioniert ein Deal?',
  'Content-Missions erfüllen',
  'Anfragen & Status',
  'Event-Einladungen',
  'Check-In Probleme',
  'Tier & Rating',
  'Mein Profil',
]

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const welcome: Message = {
      id: makeId(),
      role: 'bot',
      content: 'Hey Lena 👋\n\nIch bin dein Velvet Support. Wobei kann ich dir helfen?',
      timestamp: Date.now(),
      quickReplies: INITIAL_TOPICS,
    }
    setMessages([welcome])
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  function handleTopicClick(topic: string) {
    const userMsg: Message = {
      id: makeId(),
      role: 'user',
      content: topic,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    const entry = FAQ[topic]
    const delay = 900 + Math.min((entry?.answer.length || 0) * 8, 1600)

    setTimeout(() => {
      const botMsg: Message = {
        id: makeId(),
        role: 'bot',
        content: entry?.answer || 'Hmm, da hab ich gerade keine Antwort parat. Schreib uns deine Frage direkt — wir antworten persönlich.',
        timestamp: Date.now(),
        quickReplies: entry?.followUps,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, delay)
  }

  return (
    <main className="app-screen chat-main">
      <header className="chat-header">
        <div className="chat-avatar">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <g stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 30 35 L 50 65 L 70 35 Z" />
              <line x1="50" y1="65" x2="50" y2="80" />
              <line x1="40" y1="80" x2="60" y2="80" />
            </g>
          </svg>
        </div>
        <div className="chat-header-info">
          <div className="chat-title">Velvet Support</div>
          <div className="chat-status">
            <span className="status-dot" />
            Online · Antwort in 2 Min
          </div>
        </div>
      </header>

      <div className="chat-thread" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            {msg.role === 'bot' && (
              <div className="chat-msg-avatar">
                <svg viewBox="0 0 100 100">
                  <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 30 35 L 50 65 L 70 35 Z" />
                    <line x1="50" y1="65" x2="50" y2="80" />
                    <line x1="40" y1="80" x2="60" y2="80" />
                  </g>
                </svg>
              </div>
            )}
            <div className="chat-msg-bubble">
              <div className="chat-msg-content">
                {msg.content.split('\n').map((line, i) => (
                  <div key={i}>{line || '\u00A0'}</div>
                ))}
              </div>
              <div className="chat-msg-time">{formatTime(msg.timestamp)}</div>
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="chat-quick-replies">
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      className="chat-quick-reply"
                      onClick={() => handleTopicClick(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-msg bot">
            <div className="chat-msg-avatar">
              <svg viewBox="0 0 100 100">
                <g stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 30 35 L 50 65 L 70 35 Z" />
                  <line x1="50" y1="65" x2="50" y2="80" />
                  <line x1="40" y1="80" x2="60" y2="80" />
                </g>
              </svg>
            </div>
            <div className="chat-msg-bubble chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Frage tippen..."
          disabled
          className="chat-input"
        />
        <button disabled className="chat-send">
          <svg viewBox="0 0 24 24">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </main>
  )
}