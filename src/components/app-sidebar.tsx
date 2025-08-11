import { useState } from "react"
import { 
  Home, 
  Search, 
  FileText, 
  Users, 
  Target, 
  MessageSquare, 
  Settings,
  ChevronRight,
  Plus,
  Glasses
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { IdeaSelectDialog } from "@/components/idea-select-dialog"
import { useIdeas } from "@/hooks/use-ideas"

const mainItems = [
  { title: "New Idea", url: "/ideas", icon: Home },
  { title: "Guided Workflow", url: "/coach", icon: MessageSquare },
]

const searchItem = { title: "Search", icon: Search }

const workspaceItems = [
  { 
    title: "Canvas Tools", 
    icon: FileText,
    items: [
      { title: "Deconstruction", module: "deconstruct" },
      { title: "Evidence", module: "evidence" },
      { title: "Discovery", module: "discovery" },
      { title: "Synthesis", module: "synthesis" },
      { title: "Design", module: "design" },
    ]
  }
]


export function AppSidebar({ onSearchClick }: { onSearchClick?: () => void }) {
  const { state, isMobile } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const { ideas } = useIdeas()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "canvas-tools": true,
  })
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false)
  const [targetModule, setTargetModule] = useState<string | null>(null)
  const isActive = (path: string) => currentPath === path
  const isModuleActive = (module: string) => currentPath.includes('/ideas/') && currentPath.endsWith(`/${module}`)
  const isGroupActive = (items: any[]) => items.some((item: any) => (item.url ? isActive(item.url) : item.module ? isModuleActive(item.module) : false))
  
  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const handleNavigateToModule = (module: string) => {
    setTargetModule(module)
    setIdeaDialogOpen(true)
  }

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} sidebar-borderless`}
      collapsible="icon"
    >
      <SidebarHeader className="">
        <div
          className={`flex w-full items-center gap-2 cursor-pointer ${collapsed ? 'justify-center px-0 py-2 mt-2' : 'justify-start px-3 py-2 mt-2'}`}
          role="button"
          aria-label="Go to Ideas Hub"
          onClick={() => {
            window.dispatchEvent(new Event('open-ideas-hub'))
            navigate('/ideas')
          }}
        >
          <div className="w-7 h-7 bg-sidebar-primary rounded flex items-center justify-center">
            <Glasses className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground">StartupDetective</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild
                  isActive={isActive(item.url)}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                >
                  <NavLink
                    to={item.url}
                    onClick={() => window.dispatchEvent(new Event('open-ideas-hub'))}
                    className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            
            {/* Search Item - Special handling */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onSearchClick}
                className="cursor-pointer"
              >
                <div className={`flex items-center gap-3 justify-between w-full ${collapsed ? 'justify-center' : ''}`}>
                  <div className="flex items-center gap-3">
                    <searchItem.icon className="w-4 h-4" />
                    {!collapsed && <span>{searchItem.title}</span>}
                  </div>
                  {!collapsed && (
                    <span className="text-xs text-sidebar-muted bg-sidebar-accent px-1.5 py-0.5 rounded">⌘K</span>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Ideas Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs font-medium">
            {!collapsed && "Ideas"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ideas.map((i) => {
                const slug = encodeURIComponent(i.text.trim().replace(/\s+/g, '-'))
                const url = `/ideas/${slug}/coach`
                return (
                  <SidebarMenuItem key={i.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPath.startsWith(`/ideas/${slug}`)}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                    >
                      <NavLink to={url} className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <FileText className="w-4 h-4" />
                        {!collapsed && <span className="truncate max-w-[140px]" title={i.text}>{i.text}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {ideas.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/ideas" className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                      <Plus className="w-4 h-4" />
                      {!collapsed && <span>Start a new idea</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <IdeaSelectDialog
        open={ideaDialogOpen}
        onOpenChange={setIdeaDialogOpen}
        onSubmit={(ideaName) => {
          if (!targetModule) return
          const slug = encodeURIComponent(ideaName.trim().replace(/\s+/g, '-'))
          navigate(`/ideas/${slug}/${targetModule}`)
        }}
      />

      <SidebarFooter className="" >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                <Settings className="w-4 h-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}