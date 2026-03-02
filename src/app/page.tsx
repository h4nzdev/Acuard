import Link from "next/link"
import { ShieldAlert, BookOpen, Fingerprint, BarChart3, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
            <span className="text-2xl font-headline font-bold text-primary">Acuard</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login?role=student">Student Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login?role=instructor">Instructor Portal</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-24 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-6xl font-headline font-bold text-slate-900 leading-tight">
              Upholding Academic Integrity with <span className="text-primary">Intelligence</span>.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Acuard uses advanced behavioral biometrics and AI-driven analysis to protect the value of credentials in the digital age.
            </p>
            <div className="flex justify-center gap-6 pt-8">
              <Button size="lg" className="px-8 py-6 text-lg h-auto" asChild>
                <Link href="/login?role=instructor">Get Started as Instructor</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg h-auto" asChild>
                <Link href="/login?role=student">Student Portal</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-headline font-bold text-center mb-16">Advanced Integrity Monitoring</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <FeatureCard 
                icon={Fingerprint}
                title="Writing Fingerprinting"
                description="Establish unique writing and typing baselines for every student to detect style deviations automatically."
              />
              <FeatureCard 
                icon={BarChart3}
                title="Behavioral Analysis"
                description="Track typing speed, copy-paste patterns, and tab switching in real-time with machine learning risk scoring."
              />
              <FeatureCard 
                icon={Lock}
                title="Dynamic Policies"
                description="Configure granular copy-paste and monitoring rules per assessment to match specific pedagogical needs."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2024 Acuard LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow duration-300">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-headline font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
