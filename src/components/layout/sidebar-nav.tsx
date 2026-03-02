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
  const [isHovered, setIsHovered] = useState(false)

  // The sidebar is visually expanded if it's either not manually collapsed OR if the user is hovering.
  const isExpanded = !isCollapsed || isHovered

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
        "relative flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl transition-all duration-300 ease-in-out shrink-0 z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The actual content container that expands on hover */}
      <div 
        className={cn(
          "absolute top-0 left-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border shadow-xl transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <div className={cn(
            "flex flex-col gap-4 mb-8",
            isExpanded ? "items-stretch" : "items-center"
          )}>
            <div className={cn(
              "flex items-center min-h-[40px]",
              isExpanded ? "justify-between" : "justify-center"
            )}>
              {isExpanded ? (
                <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                  <ShieldAlert className="w-8 h-8 text-accent shrink-0" />
                  <h1 className="text-xl font-headline font-bold tracking-tight">AcademiaGuard</h1>
                </div>
              ) : (
                <ShieldAlert className="w-8 h-8 text-accent" />
              )}
              
              {isExpanded && !isHovered && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(true);
                  }}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>

            {!isExpanded && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(false);
                  setIsHovered(false);
                }}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
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
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-[1.02]" 
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground opacity-80 hover:opacity-100",
                    !isExpanded && "justify-center px-0"
                  )}
                  title={!isExpanded ? link.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isExpanded && (
                    <span className="font-medium text-sm overflow-hidden whitespace-nowrap animate-in slide-in-from-left-2 duration-200">
                      {link.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-sidebar-border">
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 opacity-80 hover:opacity-100 cursor-pointer mb-2 rounded-md hover:bg-sidebar-accent",
              !isExpanded && "justify-center px-0"
            )}>
              <User className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="text-sm font-medium animate-in fade-in duration-200">Profile</span>}
            </div>
            <Link 
              href="/" 
              className={cn(
                "flex items-center gap-3 px-4 py-3 opacity-80 hover:opacity-100 cursor-pointer text-red-300 rounded-md hover:bg-sidebar-accent",
                !isExpanded && "justify-center px-0"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="text-sm font-medium animate-in fade-in duration-200">Log out</span>}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
