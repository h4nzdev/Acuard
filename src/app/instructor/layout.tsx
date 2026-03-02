import { SidebarNav } from "@/components/layout/sidebar-nav"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav role="instructor" />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
