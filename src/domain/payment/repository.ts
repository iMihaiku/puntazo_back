import { type Payment } from './value'

export interface PaymentRepository {
  createIntentPayment: (payment: Payment, currency: string) => Promise<void>
  cancelIncompleteIntents: () => Promise<void>
  cancelIncompleteIntentById: (intentId: string) => Promise<void>
}
