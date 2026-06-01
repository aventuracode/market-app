'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  loading?: boolean
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  loading = false,
  autoFocus = false,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none transition-colors" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-11 pr-11 h-11 text-base bg-muted/30 border-muted-foreground/20 focus:bg-background focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/50"
        autoComplete="off"
        autoFocus={autoFocus}
      />
      {value && !loading && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      {loading && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
