import React, { useState, useEffect } from 'react'
import { Star, User } from 'lucide-react'
import reviews from './reviews'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const UserReviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length)
    }, 5000) // Change review every 5 seconds

    return () => clearInterval(timer)
  }, [])

  const getReviewIndex = (index: number) => (currentIndex + index) % reviews.length

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="mr-2 text-yellow-500" />
          User Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((offset) => {
            const review = reviews[getReviewIndex(offset)]
            return (
              <Card key={review.id} className="transition-all duration-500 ease-in-out transform hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-2">
                    <Avatar className="mr-2">
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2 h-24 overflow-y-auto">{review.content}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={i < review.rating ? "text-yellow-500" : "text-muted-foreground"}
                        size={16}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="flex justify-center mt-4">
          {reviews.map((_, index) => (
            <Badge
              key={index}
              variant={index === currentIndex ? "default" : "secondary"}
              className="mx-1 cursor-pointer"
              onClick={() => setCurrentIndex(index)}
            >
              &bull;
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default UserReviews