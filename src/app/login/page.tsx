"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ShieldAlert, User, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = searchParams.get('role') || 'student'

  const handleLogin = () => {
    if (role === 'instructor') {
      router.push('/instructor/dashboard')
    } else {
      router.push('/student/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline">AcademiaGuard Login</CardTitle>
          <CardDescription>
            Access the {role} portal to manage academic integrity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button 
              className="w-full h-14 text-lg font-medium flex items-center gap-3"
              onClick={handleLogin}
            >
              {role === 'instructor' ? <User className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
              Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or switch role</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-12"
              onClick={() => router.push(`/login?role=${role === 'instructor' ? 'student' : 'instructor'}`)}
            >
              Login as {role === 'instructor' ? 'Student' : 'Instructor'} instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
