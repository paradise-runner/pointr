'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import LoadingScreen from '../../LoadingScreen'
import { Home, Users, PlusCircle, Vote, Check, X, ChevronRight, Star, Clock, BarChart2 , User, List, Edit, AlertTriangle, ThumbsUp, Square, Play} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ModeToggle } from '../../ModeToggle'

interface Story {
  id: string
  session_id: string
  title: string
  points: number | null
}

interface User {
  id: string
  session_id: string
  name: string
}

interface Session {
  id: string
  user_id: string
}

interface SessionState {
  id: string
  is_voting: boolean
  current_story_id: string | null
}


interface Vote {
  id: string
  session_id: string
  story_id: string
  user_id: string
  points: number
}

export const runtime = 'edge';

export default function Session() {
  const [stories, setStories] = useState<Story[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userName, setUserName] = useState('')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [userVote, setUserVote] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const params = useParams<{ id: string }>()
  const sessionId = params.id
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const storiesRef = useRef<Story[]>([])
  storiesRef.current = stories
  

  useEffect(() => {
    if (sessionId) {
      fetchInitialData(sessionId)
      setupRealtimeSubscriptions(sessionId)
      checkForExistingUser(sessionId)
    }
  }, [sessionId])
  


  const fetchInitialData = async (sid: string) => {
    try {

      const [storiesData, usersData] = await Promise.all([
        supabase.from('stories').select('*').eq('session_id', sid),
        supabase.from('users').select('*').eq('session_id', sid),
      ])

      if (storiesData.error) throw storiesData.error
      if (usersData.error) throw usersData.error

      setStories(storiesData.data || [])
      setUsers(usersData.data || [])
      await fetchOrCreateSessionState(sid)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to fetch initial data. Please try again.')
      setIsLoading(false)
    }
  }

  async function fetchOrCreateSessionState(sid: string): Promise<void> {
    try {
      // Attempt to fetch the existing session state
      let { data, error } = await supabase
        .from('session_states')
        .select('*')
        .eq('id', sid)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No matching row found, create a new session state
          const { data: newData, error: upsertError } = await supabase
            .from('session_states')
            .upsert({ id: sid, is_voting: false, current_story_id: null })
            .select()
            .single()

          if (upsertError) throw upsertError

          data = newData
        } else {
          throw error
        }
      }

      setSessionState(data)

      if (data.is_voting && data.current_story_id) {
        const currentStory = storiesRef.current.find(story => story.id === data.current_story_id)
        if (currentStory) {
          setSelectedStory(currentStory)
          fetchVotes(currentStory.id)
        }

      }
    } catch (error) {
      console.error('Error fetching or creating session state:', error)
      setError('Failed to initialize session state. Please try again.')
    }
  }

  const setupRealtimeSubscriptions = (sid: string) => {
    const storiesChannel = supabase
      .channel('stories_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stories', filter: `session_id=eq.${sid}` },
        (payload) => {
          console.log('Stories change received:', payload)
          handleStoriesChange(payload)
        }
      )
      .subscribe()

    const usersChannel = supabase
      .channel('users_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users', filter: `session_id=eq.${sid}` },
        (payload) => {
          console.log('Users change received:', payload)
          handleUsersChange(payload)
        }
      )
      .subscribe()

      const votesChannel = supabase
      .channel('votes_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes', filter: `session_id=eq.${sid}` },
        handleVotesChange
      )
      .subscribe()

      const sessionStateChannel = supabase
      .channel('session_state_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'session_states', filter: `id=eq.${sid}` },
        handleSessionStateChange
      )
      .subscribe()

    return () => {
      supabase.removeChannel(storiesChannel)
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(votesChannel)
      supabase.removeChannel(sessionStateChannel)
    }
  }

  const handleSessionStateChange = (payload: any) => {
    console.log('Session state change received:', payload)
    if (payload.eventType === 'UPDATE') {
      setSessionState(payload.new)
      if (payload.new.is_voting && payload.new.current_story_id) {

        let currentStory = storiesRef.current.find(story => story.id == payload.new.current_story_id)
        console.log('Setting selected story:', currentStory)

        if (currentStory) {
          setSelectedStory(currentStory)
          fetchVotes(currentStory.id)
        }
      } else {
        setSelectedStory(null)
        setVotes([])
      }
    }
  }

  const handleStoriesChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setStories(prevStories => [...prevStories, payload.new])
    } else if (payload.eventType === 'UPDATE') {
      setStories(prevStories => prevStories.map(story => 
        story.id === payload.new.id ? payload.new : story
      ))
    } else if (payload.eventType === 'DELETE') {
      setStories(prevStories => prevStories.filter(story => story.id !== payload.old.id))
    }
  }

  const handleUsersChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setUsers(prevUsers => [...prevUsers, payload.new])
    } else if (payload.eventType === 'UPDATE') {
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === payload.new.id ? payload.new : user
      ))
      if (currentUser && currentUser.id === payload.new.id) {
        setCurrentUser(payload.new)
      }
    } else if (payload.eventType === 'DELETE') {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== payload.old.id))
    }
  }

  const handleVotesChange = (payload: any) => {
    console.log('Votes change received:', payload)
    if (payload.eventType === 'INSERT') {
      setVotes(prevVotes => {
        const newVotes = [...prevVotes, payload.new]
        return newVotes
      })
    } else if (payload.eventType === 'UPDATE') {
      setVotes(prevVotes => {
        const newVotes = prevVotes.map(vote => 
          vote.id === payload.new.id ? payload.new : vote
        )
        return newVotes
      })
    } else if (payload.eventType === 'DELETE') {
      setVotes(prevVotes => {
        const newVotes = prevVotes.filter(vote => vote.id !== payload.old.id)
        return newVotes
      })
    }
  }

  const checkForExistingUser = async (sid: string) => {
    const storedUserId = localStorage.getItem(`userId_${sid}`)
    if (storedUserId) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', storedUserId)
          .single()

        if (error) throw error

        if (data) {
          setCurrentUser(data)
          setUserName(data.name)
        }
      } catch (error) {
        console.error('Error fetching existing user:', error)
        localStorage.removeItem(`userId_${sid}`)
      }
    }
  }

  const isNameUnique = (name: string): boolean => {
    return !users.some(user => user.name.toLowerCase() === name.toLowerCase() && user.id !== currentUser?.id)
  }

  const getUniqueNameSuggestion = (name: string): string => {
    let suggestion = name
    let counter = 1
    while (!isNameUnique(suggestion)) {
      suggestion = `${name}_${counter}`
      counter++
    }
    return suggestion
  }

  const createOrUpdateUser = async () => {
    setError(null)
    if (!userName.trim() || !sessionId) return

    const trimmedName = userName.trim()

    if (!isNameUnique(trimmedName)) {
      const suggestion = getUniqueNameSuggestion(trimmedName)
      setError(`The name "${trimmedName}" is already taken. How about "${suggestion}"?`)
      return
    }

    if (currentUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({ name: trimmedName })
        .eq('id', currentUser.id)

      if (error) {
        console.error('Error updating user:', error)
        setError('Failed to update user. Please try again.')
      } else {
        setCurrentUser({ ...currentUser, name: trimmedName })
      }
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          session_id: sessionId,
          name: trimmedName
        })
        .select()

      if (error) {
        console.error('Error creating user:', error)
        setError('Failed to create user. Please try again.')
      } else {
        setCurrentUser(data[0])
        localStorage.setItem(`userId_${sessionId}`, data[0].id)
      }
    }
  }

  const addStory = async () => {
    setError(null)
    if (!newStoryTitle.trim() || !sessionId) return

    if (stories.some(story => story.title.toLowerCase() === newStoryTitle.trim().toLowerCase())) {
      setError('A story with this title already exists.')
      return
    }

    const { error } = await supabase
      .from('stories')
      .insert({
        session_id: sessionId,
        title: newStoryTitle.trim(),
        points: null
      })

    if (error) {
      console.error('Error adding story:', error)
      setError('Failed to add story. Please try again.')
    } else {
      setNewStoryTitle('')
    }
  }

  const startVoting = async (story: Story) => {
    try {
      const { error } = await supabase
        .from('session_states')
        .update({ is_voting: true, current_story_id: story.id })
        .eq('id', sessionId)

      if (error) throw error

      setSelectedStory(story)
      
    } catch (error) {
      console.error('Error starting voting:', error)
      setError('Failed to start voting. Please try again.')
    }
  }

  const submitVote = async () => {
    if (!currentUser || !selectedStory || userVote === null) return

    // check if user has already voted
    const existingVote = votes.find(vote => vote.story_id === selectedStory.id && vote.user_id === currentUser.id)

    if (existingVote) {
      try {
        const { error } = await supabase
          .from('votes')
          .update({ points: userVote })
          .eq('id', existingVote.id)

        if (error) throw error

        setUserVote(null)
      } catch (error) {
        console.error('Error updating vote:', error)
        setError('Failed to update vote. Please try again.')
      }

      return
    }

    try {
      const { data, error } = await supabase
        .from('votes')
        .upsert({
          session_id: sessionId,
          story_id: selectedStory.id,
          user_id: currentUser.id,
          points: userVote
        })

      if (error) throw error

      setUserVote(null)
    } catch (error) {
      console.error('Error submitting vote:', error)
      setError('Failed to submit vote. Please try again.')
    }

  }

  const fetchVotes = async (storyId: string) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('session_id', sessionId)
        .eq('story_id', storyId)

      if (error) throw error

      setVotes(data || [])
    } catch (error) {
      console.error('Error fetching votes:', error)
      setError('Failed to fetch votes. Please try again.')
    }
  }

  const endVoting = async () => {
    if (!selectedStory) return

    try {
      const finalPoints = calculateFibonacciAverage(votes)
      const [{ error: storyError }, { error: sessionStateError }] = await Promise.all([
        supabase
          .from('stories')
          .update({ points: finalPoints })
          .eq('id', selectedStory.id),
        supabase
          .from('session_states')
          .update({ is_voting: false, current_story_id: null })
          .eq('id', sessionId)
      ])

      if (storyError) throw storyError
      if (sessionStateError) throw sessionStateError

      setVotes([])
    } catch (error) {
      console.error('Error ending voting:', error)
      setError('Failed to end voting. Please try again.')
    }
  }

  const calculateFinalPoints = (votes: Vote[]): number => {
    // Implement your logic to calculate final points
    // For example, you could use the average or the median
    const sum = votes.reduce((acc, vote) => acc + vote.points, 0)
    return Math.round(sum / votes.length)
  }

  const allUsersVoted = users.length > 0 && votes.length === users.length

  const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]; // Extended sequence

  const calculateFibonacciAverage = (votes: Vote[]): number => {
    if (votes.length === 0) return 0;
    
    const sum = votes.reduce((acc, vote) => acc + vote.points, 0);
    const arithmeticMean = sum / votes.length;
    
    // Find the closest Fibonacci number
    return fibonacciSequence.reduce((prev, curr) => {
      return (Math.abs(curr - arithmeticMean) < Math.abs(prev - arithmeticMean) ? curr : prev);
    });
  };
  if (isLoading) {
    return <LoadingScreen/>
  }


  return  (   <div className="min-h-screen bg-background text-foreground">
  <header className="bg-card">
    <div className="container mx-auto p-4 flex justify-between items-center">
      <span className="text-xl font-bold flex items-center">
        <BarChart2 className="mr-2" />
        pointr.
      </span>
      <Link href="/">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Home className="mr-2" />
          Home
        </Button>
      </Link>
      <ModeToggle />
    </div>
  </header>

  <main className="container mx-auto p-8">
    <h1 className="text-6xl font-extrabold mb-2 leading-tight">
      <span className="text-foreground">The </span>
      <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">Next Generation</span>
      <span className="text-foreground"> story pointing tool.</span>
    </h1>
    <p className="text-xl text-muted-foreground mb-8 flex items-center">
      <Star className="mr-2 text-yellow-500" />
      The source of truth for your team's estimations, stories, and project planning.
    </p>

    <p className="text-xl mb-8 flex items-center">
      <ChevronRight className="mr-2 text-blue-500" />
      Session ID: {sessionId}
    </p>

    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 text-blue-500" />
          Your User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={currentUser ? "Change your name" : "Enter your name"}
            className="flex-grow mr-2"
          />
          <Button 
            onClick={createOrUpdateUser} 
            disabled={!sessionId || !userName.trim()}
          >
            {currentUser ? <Edit className="mr-1" /> : <PlusCircle className="mr-1" />}
            {currentUser ? "Update Name" : "Join Session"}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 text-green-500" />
            Users in Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
                {user.id === currentUser?.id && (
                  <Badge variant="secondary" className="ml-2">You</Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 text-yellow-500" />
              Add New Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Input
                type="text"
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="Enter new story title"
                className="flex-grow mr-2"
              />
              <Button 
                onClick={addStory} 
                disabled={!sessionId || !newStoryTitle.trim()}
              >
                <PlusCircle className="mr-1" />
                Add Story
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <List className="mr-2 text-purple-500" />
          Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {stories.map((story) => (
            <li key={story.id} className="flex items-center justify-between">
              <span className="text-lg flex items-center">
                <ChevronRight className="mr-2 text-blue-400" />
                {story.title}
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant={story.points ? "default" : "secondary"}>
                  {story.points ? <Star className="mr-1 text-yellow-500" /> : <Clock className="mr-1" />}
                  {story.points || 'Not pointed'}
                </Badge>
                {!sessionState?.is_voting && (
                  <Button
                    onClick={() => startVoting(story)}
                    size="sm"
                    variant="outline"
                  >
                    <Play className="mr-1" size={14} />
                    Vote
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>

    {sessionState?.is_voting && selectedStory && (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Vote className="mr-2 text-green-500" />
            Voting for: {selectedStory.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3, 5, 8, 13].map((point) => (
              <Button
                key={point}
                onClick={() => setUserVote(point)}
                variant={userVote === point ? "default" : "outline"}
              >
                {userVote === point && <Check className="mr-1" size={14} />}
                {point}
              </Button>
            ))}
          </div>
          <Button
            onClick={submitVote}
            disabled={userVote === null}
            className="mb-4"
          >
            <ThumbsUp className="mr-1" />
            Submit Vote
          </Button>
          <Separator className="my-4" />
          <h3 className="text-xl font-bold mb-2 flex items-center">
            <List className="mr-2 text-blue-500" />
            Current Votes:
          </h3>
          <ul>
            {votes
              .filter(vote => vote.story_id === selectedStory.id)
              .map((vote, index) => (
                <li key={vote.id} className="flex items-center">
                  <User className="mr-2 text-muted-foreground" />
                  User {index + 1}: {vote.points}
                </li>
              ))}
          </ul>
          {allUsersVoted && (
            <Button
              onClick={endVoting}
              className="mt-4"
              variant="secondary"
            >
              <Square className="mr-1" />
              End Voting
            </Button>
          )}
        </CardContent>
      </Card>
    )}
  </main>
</div>
)
}