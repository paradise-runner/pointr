import React from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Loading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-center">
            Preparing your story pointing session...
          </p>
          <Progress value={70} className="w-full" />
        </CardContent>
      </Card>
      <p className="mt-8 text-xl font-bold">
        <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
          Story Pointing App
        </span>
      </p>
    </div>
  )
}

export default LoadingScreen