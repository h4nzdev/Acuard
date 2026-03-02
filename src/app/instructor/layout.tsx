import { SidebarNav } from "@/components/layout/sidebar-nav"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SidebarNav role="instructor" />
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="container mx-auto p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
