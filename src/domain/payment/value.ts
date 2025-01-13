import { type PaymentEntity } from './entity'

export class Payment implements PaymentEntity {
  public readonly intent_id: string
  public readonly product_id: string
  public readonly user_id: string
  public readonly currency: string
  public readonly amount: number
  public readonly created_at: Date

  constructor(
    intentId: string,
    productId: string,
    userId: string,
    currency: string,
    amount: number
  ) {
    this.intent_id = intentId
    this.product_id = productId
    this.user_id = userId
    this.currency = currency
    this.amount = amount
    this.created_at = new Date()
  }
}
