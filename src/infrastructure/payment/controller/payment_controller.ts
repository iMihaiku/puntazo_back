import { type PaymentCases } from '@/app/payment/cases'
import { type Request, type Response } from 'express'

export class PaymentController {
  constructor(private readonly paymentController: PaymentCases) {
    this.intentPayment = this.intentPayment.bind(this)
    this.cancelIncompleteIntents = this.cancelIncompleteIntents.bind(this)
    this.cancelIncompleteIntentById = this.cancelIncompleteIntentById.bind(this)
  }

  public async cancelIncompleteIntents(
    req: Request,
    res: Response
  ): Promise<void> {
    const connectionResult = await this.paymentController.cancelIncompleteIntents()
    if (connectionResult === 'error') {
      res.status(400).json({ error: 'Error deleting payment incomplete intents ' })
    } else {
      res.status(200).json({ status: connectionResult })
    }
  }

  public async cancelIncompleteIntentById(
    req: Request,
    res: Response
  ): Promise<void> {
    const { intentId } = req.params
    const connectionResult = await this.paymentController.cancelIncompleteIntentById(intentId!)
    if (connectionResult === 'error') {
      res.status(400).json({ error: 'Error deleting payment incomplete intents ' })
    } else {
      res.status(200).json({ status: connectionResult })
    }
  }

  public async intentPayment(req: Request, res: Response): Promise<void> {
    const { productId, userId } = req.body
    if (!productId || !userId) {
      res.status(400).json({ error: 'Missing parameters' })
      return
    }
    const connectionResult = await this.paymentController.intentPayment(
      productId as string,
      userId as string
    )
    if (connectionResult === 'error') {
      res.status(400).json({ error: 'Error creating payment intent' })
    } else {
      res.status(200).json({ client_response: connectionResult })
    }
  }
}
