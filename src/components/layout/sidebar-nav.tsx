"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Settings, 
  PenTool, 
  User, 
  LogOut, 
  History,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarNavProps {
  role: 'student' | 'instructor'
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const links = role === 'instructor' ? [
    { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/instructor/monitoring", label: "Live Monitoring", icon: Activity },
    { href: "/instructor/assessments", label: "Assessments", icon: FileText },
    { href: "/instructor/settings", label: "Policies", icon: Settings },
  ] : [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/baseline", label: "Writing Baseline", icon: PenTool },
    { href: "/student/assessments", label: "My Assessments", icon: FileText },
    { href: "/student/history", label: "History", icon: History },
  ]

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 min-h-[40px]">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <ShieldAlert className="w-8 h-8 text-accent shrink-0" />
              <h1 className="text-xl font-headline font-bold tracking-tight">AcademiaGuard</h1>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <ShieldAlert className="w-8 h-8 text-accent" />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed && "absolute -right-3 top-20 bg-sidebar border border-sidebar-border rounded-full shadow-md z-10 w-6 h-6"
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        
        <nav className="space-y-2 flex-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-[1.02]" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground opacity-80 hover:opacity-100",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm overflow-hidden whitespace-nowrap">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 opacity-80 hover:opacity-100 cursor-pointer mb-2 rounded-md hover:bg-sidebar-accent",
            isCollapsed && "justify-center px-0"
          )}>
            <User className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Profile</span>}
          </div>
          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-3 px-4 py-3 opacity-80 hover:opacity-100 cursor-pointer text-red-300 rounded-md hover:bg-sidebar-accent",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
          </Link>
        </div>
      </div>
    </div>
  )
}
