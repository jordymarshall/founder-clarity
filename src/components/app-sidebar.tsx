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
  Plus
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

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

const mainItems = [
  { title: "Ideas Hub", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
]

const workspaceItems = [
  { 
    title: "Canvas Tools", 
    icon: FileText,
    items: [
      { title: "Deconstruction", url: "/deconstruct" },
      { title: "Evidence", url: "/evidence" },
      { title: "Discovery", url: "/discovery" },
      { title: "Synthesis", url: "/synthesis" },
    ]
  },
  { title: "Customer Research", url: "/research", icon: Users },
  { title: "Validation", url: "/validation", icon: Target },
]

const projectItems = [
  { title: "My Projects", url: "/projects", icon: FileText },
  { title: "Templates", url: "/templates", icon: FileText },
]

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "canvas-tools": true,
  })

  const isActive = (path: string) => currentPath === path
  const isGroupActive = (items: any[]) => items.some(item => isActive(item.url))
  
  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-6 h-6 bg-sidebar-primary rounded flex items-center justify-center">
            <Target className="w-4 h-4 text-sidebar-primary-foreground" />
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
                  <NavLink to={item.url} className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Workspace Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs font-medium">
            {!collapsed && "Workspace"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => {
                if (item.items) {
                  const groupKey = item.title.toLowerCase().replace(/\s+/g, '-')
                  const isOpen = openGroups[groupKey]
                  const hasActiveItems = isGroupActive(item.items)
                  
                  return (
                    <Collapsible 
                      key={item.title} 
                      open={isOpen} 
                      onOpenChange={() => toggleGroup(groupKey)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className="data-[state=open]:bg-sidebar-accent w-full justify-between"
                            isActive={hasActiveItems}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-4 h-4" />
                              {!collapsed && <span>{item.title}</span>}
                            </div>
                            {!collapsed && (
                              <ChevronRight 
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isOpen ? 'rotate-90' : ''
                                }`} 
                              />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton 
                                    asChild
                                    isActive={isActive(subItem.url)}
                                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                                  >
                                    <NavLink to={subItem.url}>{subItem.title}</NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.url!)}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                    >
                      <NavLink to={item.url!} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs font-medium">
            {!collapsed && "Projects"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {!collapsed && (
                <SidebarMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    New Project
                  </Button>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className="flex items-center gap-3">
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