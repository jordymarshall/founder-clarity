import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  MessageCircle, 
  BarChart3, 
  Target,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const workflowSteps = [
  {
    id: 'module1',
    title: 'Deconstructing Ideas',
    description: 'Capture beliefs on Lean Canvas',
    url: '/workflow/module1',
    icon: FileText,
  },
  {
    id: 'module2', 
    title: 'Finding Evidence',
    description: 'Prospect and identify candidates',
    url: '/workflow/module2',
    icon: Users,
  },
  {
    id: 'module3',
    title: 'Problem Discovery',
    description: 'Conduct customer interviews',
    url: '/workflow/module3', 
    icon: MessageCircle,
  },
  {
    id: 'module4',
    title: 'Synthesizing Truth',
    description: 'Analyze patterns and insights',
    url: '/workflow/module4',
    icon: BarChart3,
  },
  {
    id: 'module5',
    title: 'Designing Offers',
    description: 'Create compelling value propositions',
    url: '/workflow/module5',
    icon: Target,
  },
];

export function WorkflowSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string) => currentPath === path;
  const isWorkflowActive = workflowSteps.some((step) => isActive(step.url));
  
  const getNavClasses = (isActive: boolean) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-foreground";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-72"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            {!collapsed && <span>Validation Workflow</span>}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {workflowSteps.map((step, index) => (
                <SidebarMenuItem key={step.id}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={step.url} 
                      className={({ isActive }) => `
                        flex items-center gap-3 p-3 rounded-lg transition-colors
                        ${getNavClasses(isActive)}
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        
                        {!collapsed && (
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {step.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {step.description}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {!collapsed && (
                        <step.icon className="h-4 w-4 flex-shrink-0" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}