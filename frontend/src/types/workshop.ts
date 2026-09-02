export type Workshop = {
  id: string
  title: string
  category: string
  description: string
  imageUrl: string | null
  materials: string[]
  startsAt: string
  durationMin: number
  capacity: number
  availableSeats: number
  location: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type WorkshopsResponse = {
  data: Workshop[]
}
