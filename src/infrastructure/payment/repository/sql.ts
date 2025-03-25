import { type PaymentRepository } from '@/domain/payment/repository'
import { type Payment } from '@/domain/payment/value'
import { tursoClient } from '@/lib/db/turso'

export class SQLRepository implements PaymentRepository {
  public async createIntentPayment(
    payment: Payment
  ): Promise<void> {
    await tursoClient.execute({
      sql: `INSERT INTO 
          payment_intents (intent_id, product_id, user_id, currency, amount, status, created_at) 
          VALUES (:intent_id, :product_id, :user_id, :currency, :amount, :status, :created_at)`,
      args: {
        intent_id: payment.intent_id,
        product_id: payment.product_id,
        user_id: payment.user_id,
        currency: payment.currency,
        status: payment.status,
        amount: payment.amount,
        created_at: payment.created_at
      }
    })
  }

  public async cancelIncompleteIntents(): Promise<void> {
    await tursoClient.execute({
      sql: `UPDATE payment_intents
      SET status = 'Cancelled'
      WHERE status = 'Pending'`,
      args: {}
    })
  }

  public async cancelIncompleteIntentById(intentId: string): Promise<void> {
    await tursoClient.execute({
      sql: `UPDATE payment_intents
      SET status = 'Cancelled'
      WHERE intent_id = :intentId`,
      args: {
        intentId
      }
    })
  }

  public async updateIntentPayment(payment: Payment): Promise<void> {
    const { intent_id: intentId, product_id: productId, currency, amount, status } = payment
    await tursoClient.execute({
      sql: `UPDATE payment_intents
      SET status = :status,
      product_id = :productId,
      currency = :currency,
      amount = :amount
      WHERE intent_id = :intentId`,
      args: {
        status,
        productId,
        currency,
        amount,
        intentId
      }
    })
  }
}
