"use client"

import { useState, useEffect } from "react"
import Link from "next/navigation"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Settings, 
  PenTool, 
  User, 
  Users,
  LogOut, 
  History,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trophy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGlobalSettings, getStudentBaseline } from "@/lib/storage"

interface SidebarNavProps {
  role: 'student' | 'instructor'
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [requireBaseline, setRequireBaseline] = useState<boolean>(true)
  const [hasBaseline, setHasBaseline] = useState(false)

  useEffect(() => {
    const settings = getGlobalSettings()
    setRequireBaseline(settings.requireBaseline)
    
    const userStr = localStorage.getItem('ag_current_user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setHasBaseline(!!getStudentBaseline(user.id))
    }
  }, [pathname])

  const isExpanded = !isCollapsed || isHovered

  const showWritingBaseline = role === 'student' && !requireBaseline && !hasBaseline

  const links = role === 'instructor' ? [
    { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/instructor/monitoring", label: "Live Monitoring", icon: Activity },
    { href: "/instructor/assessments", label: "Assessments", icon: FileText },
    { href: "/instructor/students", label: "Students", icon: Users },
    { href: "/instructor/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/instructor/settings", label: "Policies", icon: Settings },
  ] : [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(showWritingBaseline ? [{ href: "/student/baseline", label: "Writing Baseline", icon: PenTool }] : []),
    { href: "/student/assessments", label: "My Assessments", icon: FileText },
    { href: "/student/history", label: "History", icon: History },
    { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
  ]

  const profileHref = role === 'instructor' ? "/instructor/profile" : "/student/profile"

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl transition-all duration-300 ease-in-out shrink-0 z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "absolute top-0 left-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border shadow-xl transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex flex-col gap-4 mb-8">
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
              
              {isExpanded && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(!isCollapsed);
                    setIsHovered(false);
                  }}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all shrink-0"
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              )}
            </div>
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
            <Link
              href={profileHref}
              className={cn(
                "flex items-center gap-3 px-4 py-3 opacity-80 hover:opacity-100 cursor-pointer mb-2 rounded-md hover:bg-sidebar-accent",
                pathname === profileHref ? "bg-sidebar-accent text-sidebar-accent-foreground" : "",
                !isExpanded && "justify-center px-0"
              )}
            >
              <User className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="text-sm font-medium animate-in fade-in duration-200">Profile</span>}
            </Link>
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
