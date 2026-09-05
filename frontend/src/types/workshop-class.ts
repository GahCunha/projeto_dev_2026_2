export type ClassMeeting = {
  id: string
  startsAt: string
  endsAt: string
  location: string
}

export type WorkshopClass = {
  id: string
  workshopId: string
  name: string
  capacity: number
  price: number
  active: boolean
  meetings: ClassMeeting[]
  occupiedSeats: number
  availableSeats: number
}

export type WorkshopClassesResponse = {
  data: WorkshopClass[]
}

export type ClassMeetingInput = {
  startsAt: string
  endsAt: string
  location: string
}

export type ClassFormData = {
  name: string
  capacity: number
  price: number
  meetings: ClassMeetingInput[]
}

export type WorkshopClassResponse = {
  data: WorkshopClass
}
