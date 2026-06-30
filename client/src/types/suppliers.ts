export type DeliveryLineItem = {
  name: string
  quantity: number
  unit?: string
  unitCost?: number
}

export type Delivery = {
  id: string
  supplierId: string
  deliveryDate: string
  items: DeliveryLineItem[]
  totalAmount: number
}
