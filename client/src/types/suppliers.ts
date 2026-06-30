export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'ORDER_DUE'
export type DeliveryStatus = 'DELIVERED' | 'PENDING'

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
  status?: DeliveryStatus
}

// Cross-supplier delivery returned by GET /deliveries/recent.
// May carry a pre-resolved supplierName so callers skip a local lookup.
export type CrossSupplierDelivery = Delivery & {
  supplierName?: string
}
