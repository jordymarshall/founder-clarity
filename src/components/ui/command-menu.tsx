import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, FileText, MessageSquare } from 'lucide-react'
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

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate()

  const commands = [
    {
      id: 'ideas-hub',
      label: 'Ideas Hub',
      icon: FileText,
      action: () => {
        window.dispatchEvent(new Event('open-ideas-hub'))
        navigate('/')
      },
    },
    {
      id: 'coach',
      label: 'Ask Coach',
      icon: MessageSquare,
      action: () => {
        window.dispatchEvent(new Event('open-coach-panel'))
      },
    },
    { id: 'new-idea', label: 'New Idea', icon: Lightbulb, action: () => console.log('New idea') },
  ] as const

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
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
