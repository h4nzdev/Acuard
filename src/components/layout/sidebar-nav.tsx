"use client"

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
  FileText
} from "lucide-react"

interface SidebarNavProps {
  role: 'student' | 'instructor'
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()

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
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <ShieldAlert className="w-8 h-8 text-accent" />
          <h1 className="text-xl font-headline font-bold tracking-tight">AcademiaGuard</h1>
        </div>
        
        <nav className="space-y-2">
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
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground opacity-80 hover:opacity-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 opacity-80 hover:opacity-100 cursor-pointer mb-2">
          <User className="w-5 h-5" />
          <span className="text-sm font-medium">Profile</span>
        </div>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 opacity-80 hover:opacity-100 cursor-pointer text-red-300">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </Link>
      </div>
    </div>
  )
}
