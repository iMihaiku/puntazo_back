export interface PaymentEntity {
  intent_id: string
  product_id: string
  user_id: string
  currency: string
  amount: number
  created_at: Date
}
