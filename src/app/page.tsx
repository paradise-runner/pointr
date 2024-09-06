'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { PlusCircle, Users, CheckCircle, Lock, BarChart, Heart, Atom, Rocket, Database, Wind, Triangle, Rabbit, Layers } from 'lucide-react'
import UserReviews from './UserReviews' 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ModeToggle } from './ModeToggle'

export default function Home() {
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const createNewSession = () => {
    const newSessionId = uuidv4()
    router.push(`/session/${newSessionId}`)
  }

  const joinSession = () => {
    if (sessionId.trim()) {
      router.push(`/session/${sessionId.trim()}`)
    } else {
      setError('Please enter a valid session ID')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <span className="text-xl font-bold">pointr.</span>
          <ModeToggle />  {/* Add the ModeToggle component here */}
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h1 className="text-6xl font-extrabold mb-2 leading-tight">
          <span className="text-foreground">The </span>
          <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">next generation</span>
          <span className="text-foreground"> story pointing tool.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          The source of truth for your team's estimations, stories, and project planning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 text-purple-500" />
                Create a New Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createNewSession}
                className="w-full"
              >
                Start New Session
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 text-blue-500" />
                Join an Existing Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Input
                  type="text"
                  value={sessionId}
                  onChange={(e) => {
                    setSessionId(e.target.value)
                    setError(null)
                  }}
                  placeholder="Enter Session ID"
                />
                <Button 
                  onClick={joinSession}
                  className="w-full"
                >
                  Join Session
                </Button>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Choose Our Story Pointing Tool?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none space-y-2 text-muted-foreground">
              <li className="flex items-center">
                <Rabbit className="mr-2 text-yellow-500" />
                Real-time collaboration for distributed teams
              </li>
              <li className="flex items-center">
                <Users className="mr-2 text-blue-500" />
                Intuitive user interface for seamless story pointing
              </li>
              <li className="flex items-center">
                <Lock className="mr-2 text-red-500" />
                Secure and private sessions
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" />
                Instant result visualization
              </li>
              <li className="flex items-center">
                <Heart className="mr-2 text-red-500" />
                Free and open-source
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technologies Used</CardTitle>
            <CardDescription>
              Our app is built with cutting-edge technologies to ensure a smooth and efficient experience:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-none space-y-2 text-muted-foreground">
              <li className="flex items-center">
                <Triangle className="mr-2 text-blue-500" size={20} />
                <span className="font-semibold">Next.js:</span>
                <span className="ml-2">React framework for server-side rendering and optimal performance</span>
              </li>
              <li className="flex items-center">
                <Atom className="mr-2 text-blue-400" size={20} />
                <span className="font-semibold">React:</span>
                <span className="ml-2">Efficient UI library for building interactive user interfaces</span>
              </li>
              <li className="flex items-center">
                <Rocket className="mr-2 text-blue-600" size={20} />
                <span className="font-semibold">TypeScript:</span>
                <span className="ml-2">Strongly-typed JavaScript for improved developer experience and code quality</span>
              </li>
              <li className="flex items-center">
                <Wind className="mr-2 text-teal-500" size={20} />
                <span className="font-semibold">Tailwind CSS:</span>
                <span className="ml-2">Utility-first CSS framework for rapid UI development</span>
              </li>
              <li className="flex items-center">
                <Database className="mr-2 text-green-500" size={20} />
                <span className="font-semibold">Supabase:</span>
                <span className="ml-2">Open-source Firebase alternative for real-time database and authentication</span>
              </li>
              <li className="flex items-center">
                <Layers className="mr-2 text-purple-500" size={20} />
                <span className="font-semibold">shadcn/ui:</span>
                <span className="ml-2">Beautifully designed components built with Radix UI and Tailwind CSS</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <UserReviews />

        <p className="text-muted-foreground mt-8">
          Create a new session to start story pointing, or enter an existing session ID to join a session.
        </p>
      </main>
    </div>
  )
}