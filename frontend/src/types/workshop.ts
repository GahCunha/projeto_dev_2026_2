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

export type AdminWorkshop = Workshop & {
  enrollmentCount: number
  occupiedSeats: number
}

export type WorkshopFormData = {
  title: string
  category: string
  description: string
  imageUrl: string | null
  materials: string[]
  startsAt: string
  durationMin: number
  capacity: number
  location: string
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
