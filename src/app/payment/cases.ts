import { type PaymentRepository } from '@/domain/payment/repository'
import { Payment } from '@/domain/payment/value'
import { LogColor, Server } from '@/lib/server.logs'
// import { Payment } from '@/domain/payment/value'
import Stripe from 'stripe'

export class PaymentCases {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  public async intentPayment(
    productId: string,
    userId: string
  ): Promise<string> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    let paymentIntent
    let price
    try {
      const product = await stripe.products.retrieve(productId)

      price = await stripe.prices.retrieve(product.default_price as string)

      paymentIntent = await stripe.paymentIntents.create({
        amount: price.unit_amount!,
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          productId
        }
      })
    } catch (error) {
      return 'Error creating payment intent on stripe'
    }
    const payment = new Payment(
      paymentIntent.id,
      productId,
      userId,
      price.currency,
      price.unit_amount!
    )
    try {
      await this.paymentRepository.createIntentPayment(
        payment,
        paymentIntent.id
      )
      if (!paymentIntent.client_secret) {
        return 'error'
      } else {
        Server.log(
          `The Payment intent was created and saved on BBDD: ${paymentIntent.id}`,
          LogColor.Green
        )
        return paymentIntent.client_secret
      }
    } catch (error) {
      Server.log(
        `The Payment intent was created but some error has ocurred on BBDD: ${
          error as string
        }`,
        LogColor.Red
      )
      return 'Error saving payment intent'
    }
  }

  public async cancelIncompleteIntents(): Promise<string> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const intents = await stripe.paymentIntents.list()

    try {
      intents.data.forEach(intent => {
        if (intent.status !== 'canceled' && intent.status !== 'succeeded') {
          stripe.paymentIntents.cancel(intent.id).catch(() => {})
        }
      })
    } catch (error) {
      Server.log(
        `Error while canceling on Stripe: ${error as string}`,
        LogColor.Red
      )
      return 'KO'
    }
    try {
      await this.paymentRepository.cancelIncompleteIntents()
      Server.log('The Payment intents has been canceled', LogColor.Green)
      return 'OK'
    } catch (error) {
      Server.log(
        `Error while canceling on BBDD: ${error as string}`,
        LogColor.Red
      )
      return 'KO'
    }
  }

  public async cancelIncompleteIntentById(intentId: string): Promise<string> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const intent = await stripe.paymentIntents.retrieve(intentId)

    try {
      if (
        intent.status &&
        intent.status !== 'canceled' &&
        intent.status !== 'succeeded'
      ) {
        await stripe.paymentIntents.cancel(intentId)
      }
    } catch (error) {
      Server.log(
        `Error while canceling on Stripe: ${error as string}`,
        LogColor.Red
      )
      return 'KO'
    }
    try {
      await this.paymentRepository.cancelIncompleteIntentById(intentId)
      Server.log(`The Payment intent [${intentId}] has been canceled`, LogColor.Green)
      return 'OK'
    } catch (error) {
      Server.log(
        `Error while canceling on BBDD: ${error as string}`,
        LogColor.Red
      )
      return 'KO'
    }
  }
}
