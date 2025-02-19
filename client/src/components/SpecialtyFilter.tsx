import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const specialties = [
  "All Specialties",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Family Medicine",
  "Internal Medicine"
];

interface SpecialtyFilterProps {
  onSpecialtyChange: (specialty: string) => void;
}

export function SpecialtyFilter({ onSpecialtyChange }: SpecialtyFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("All Specialties")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search specialty..." />
          <CommandEmpty>No specialty found.</CommandEmpty>
          <CommandGroup>
            {specialties.map((specialty) => (
              <CommandItem
                key={specialty}
                value={specialty}
                onSelect={(currentValue) => {
                  const selected = specialties.find(
                    (specialty) => specialty.toLowerCase() === currentValue
                  ) || "All Specialties";
                  setValue(selected)
                  setOpen(false)
                  onSpecialtyChange(selected === "All Specialties" ? "" : selected)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === specialty ? "opacity-100" : "opacity-0"
                  )}
                />
                {specialty}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
