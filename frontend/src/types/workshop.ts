export type Workshop = {
  id: string
  title: string
  category: string
  description: string
  imageUrl: string | null
  materials: string[]
  nextMeetingAt: string | null
  classCount: number
  totalCapacity: number
  occupiedSeats: number
  availableSeats: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type WorkshopsResponse = {
  data: Workshop[]
}

export type AdminWorkshop = Workshop & { enrollmentCount: number }

export type WorkshopFormData = {
  title: string
  category: string
  description: string
  imageUrl: string | null
  materials: string[]
}

export type AdminWorkshopFilters = {
  active?: boolean
  search?: string
  page: number
  pageSize?: number
}

export type WorkshopPagination = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type AdminWorkshopsResponse = {
  data: AdminWorkshop[]
  pagination: WorkshopPagination
}

export type AdminWorkshopResponse = {
  data: AdminWorkshop
}
