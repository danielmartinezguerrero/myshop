// Represents a shared digital subscription product in the store
export interface Product {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
  category: string
  slots: number        // total available slots for sharing suscription
  slotsAvailable: number  // remaining slots
}