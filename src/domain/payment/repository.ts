import { type Payment } from './value'

export interface PaymentRepository {
  createIntentPayment: (payment: Payment) => Promise<void>
  cancelIncompleteIntents: () => Promise<void>
  cancelIncompleteIntentById: (intentId: string) => Promise<void>
  updateIntentPayment: (payment: Payment) => Promise<void>
}
