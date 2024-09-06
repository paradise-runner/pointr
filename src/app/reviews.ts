interface Review {
    id: number
    name: string
    role: string
    content: string
    rating: number
  }
  

const reviews: Review[] = [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Scrum Master",
      content: "What's next generation about this? It doesn't make a lot of sense and seems excessive.",
      rating: 5
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "Product Owner",
      content: "Why do you have reviews for a story pointing tool? This is a bit much.",
      rating: 5
    },
    {
      id: 3,
      name: "Carol Davis",
      role: "Developer",
      content: "I don't understand why you need to list out all of these features. Who are you trying to impress?",
      rating: 4
    },
      {
          id: 4,
          name: "David Brown",
          role: "Designer",
          content: "Is this all just AI generated? Why are you wasting your time on this?",
          rating: 3
      },
  ]

export default reviews;