"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CourseSortSelectProps {
  value: string
  onChange: (value: string) => void
}

export function CourseSortSelect({ value, onChange }: CourseSortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popularity">Popularité</SelectItem>
        <SelectItem value="rating">Note</SelectItem>
        <SelectItem value="recent">Plus récent</SelectItem>
      </SelectContent>
    </Select>
  )
}
