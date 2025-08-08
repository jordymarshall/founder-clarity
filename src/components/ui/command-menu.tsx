import React from 'react'
import { Lightbulb, FileText, MessageSquare, Target } from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const commands = [
  { id: 'new-idea', label: 'New Idea', icon: Lightbulb, action: () => console.log('New idea') },
  { id: 'ideas-hub', label: 'Ideas Hub', icon: FileText, action: () => console.log('Ideas hub') },
  { id: 'investigation', label: 'Investigation Canvas', icon: Target, action: () => console.log('Investigation') },
  { id: 'coach', label: 'Ask Coach', icon: MessageSquare, action: () => console.log('Coach') },
]

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      {/* Input uses no focus ring to avoid the green outline */}
      <CommandInput placeholder="Search commands..." />

      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          {commands.map((command) => {
            const Icon = command.icon
            return (
              <CommandItem
                key={command.id}
                onSelect={() => {
                  command.action()
                  onOpenChange(false)
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />
      </CommandList>
    </CommandDialog>
  )
}
