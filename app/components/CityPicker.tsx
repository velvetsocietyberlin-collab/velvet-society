'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const CITIES = [
  { name: 'Berlin', count: 0 },
  { name: 'München', count: 0 },
  { name: 'Hamburg', count: 0 },
  { name: 'Köln', count: 0 },
  { name: 'Frankfurt am Main', count: 0 },
  { name: 'Düsseldorf', count: 0 },
]

type Props = {
  selectedCities: string[]
  cityCounts: Record<string, number>
}

export default function CityPicker({ selectedCities, cityCounts }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [localSelection, setLocalSelection] = useState<Set<string>>(new Set(selectedCities))

  function toggle(city: string) {
    const next = new Set(localSelection)
    if (next.has(city)) {
      if (next.size > 1) next.delete(city)
    } else {
      next.add(city)
    }
    setLocalSelection(next)
  }

  function apply() {
    const params = new URLSearchParams(searchParams.toString())
    const cities = Array.from(localSelection)
    if (cities.length === 1 && cities[0] === 'Berlin') {
      params.delete('cities')
    } else {
      params.set('cities', cities.join(','))
    }
    startTransition(() => {
      router.push(`/?${params.toString()}`)
      setIsOpen(false)
    })
  }

  // Label für den Button
  const label = (() => {
    const arr = Array.from(localSelection)
    if (arr.length === 1) return arr[0]
    const primary = arr.includes('Berlin') ? 'Berlin' : arr[0]
    return `${primary} +${arr.length - 1}`
  })()

  return (
    <>
      <button className="city-pill" onClick={() => setIsOpen(true)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{label}</span>
        <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="city-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="city-modal">
            <div className="city-grip" />
            <h3>Deine <em>Städte</em></h3>
            <p className="lead">Wähle eine oder mehrere Städte — wir zeigen dir Deals in der Nähe.</p>
            <div className="city-list">
              {CITIES.map((c) => {
                const selected = localSelection.has(c.name)
                return (
                  <div
                    key={c.name}
                    className={`city-opt ${selected ? 'selected' : ''}`}
                    onClick={() => toggle(c.name)}
                  >
                    <div className="check">
                      <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="city-name">{c.name}</div>
                    <div className="city-count">{cityCounts[c.name] || 0} Deals</div>
                  </div>
                )
              })}
            </div>
            <button className="city-done" onClick={apply} disabled={isPending}>
              {isPending ? 'Lade …' : 'Fertig'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}