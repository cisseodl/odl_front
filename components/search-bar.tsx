"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/constants"
import { mockCourses } from "@/lib/data"

interface SearchBarProps {
  onSearch?: (query: string, category: string) => void
}

const STORAGE_KEY = "search-history"

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSearchHistory(JSON.parse(stored))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Debounce search input and generate suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      
      if (query.length >= 2) {
        // Generate suggestions from courses
        const courseTitles = mockCourses.map(c => c.title.toLowerCase())
        const courseCategories = mockCourses.map(c => c.category.toLowerCase())
        const allTerms = [...courseTitles, ...courseCategories]
        
        const matches = allTerms
          .filter(term => term.includes(query.toLowerCase()))
          .slice(0, 5)
          .map(term => {
            // Capitalize first letter
            return term.charAt(0).toUpperCase() + term.slice(1)
          })
        
        setSuggestions([...new Set(matches)])
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(query.length > 0)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5)
    setSearchHistory(updated)
    
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
  }, [searchHistory])

  const handleSearch = useCallback((searchQuery?: string) => {
    const finalQuery = searchQuery || debouncedQuery || query
    if (finalQuery.trim()) {
      saveToHistory(finalQuery)
      onSearch?.(finalQuery, category)
      setShowSuggestions(false)
    }
  }, [debouncedQuery, query, category, onSearch, saveToHistory])

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem)
    handleSearch(historyItem)
  }

  const clearHistory = () => {
    setSearchHistory([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col md:flex-row gap-3 w-full max-w-4xl mx-auto relative">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          placeholder="Rechercher un cours, un sujet, un instructeur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            } else if (e.key === "Escape") {
              setShowSuggestions(false)
            }
          }}
          onFocus={() => {
            if (query.length >= 2 || searchHistory.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className="pl-10 h-12 text-base"
          aria-label="Rechercher un cours"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {suggestions.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">Suggestions</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
            
            {searchHistory.length > 0 && (
              <div className="p-2 border-t border-border">
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <p className="text-xs font-semibold text-muted-foreground">Historique</p>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Effacer
                  </button>
                </div>
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="md:w-[200px] h-12">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes catégories</SelectItem>
          {categories.slice(1).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={() => handleSearch()} size="lg" className="h-12 px-8" aria-label="Lancer la recherche">
        <Search className="h-5 w-5 md:mr-2" />
        <span className="hidden md:inline">Rechercher</span>
      </Button>
    </div>
  )
}
