import { type PaymentCases } from '@/app/payment/cases'
import { type Request, type Response } from 'express'

export class PaymentController {
  constructor(private readonly paymentController: PaymentCases) {
    this.startIntentPayment = this.startIntentPayment.bind(this)
    this.updateIntentPayment = this.updateIntentPayment.bind(this)
    this.cancelIncompleteIntents = this.cancelIncompleteIntents.bind(this)
    this.cancelIncompleteIntentById = this.cancelIncompleteIntentById.bind(this)
  }

  public async cancelIncompleteIntents(
    req: Request,
    res: Response
  ): Promise<void> {
    const connectionResult =
      await this.paymentController.cancelIncompleteIntents()
    if (connectionResult === 'error') {
      res
        .status(400)
        .json({ error: 'Error deleting payment incomplete intents ' })
    } else {
      res.status(200).json({ status: connectionResult })
    }
  }

  public async cancelIncompleteIntentById(
    req: Request,
    res: Response
  ): Promise<void> {
    const { intentId } = req.params
    const connectionResult =
      await this.paymentController.cancelIncompleteIntentById(intentId!)
    if (connectionResult === 'error') {
      res
        .status(400)
        .json({ error: 'Error deleting payment incomplete intents ' })
    } else {
      res.status(200).json({ status: connectionResult })
    }
  }

  public async startIntentPayment(req: Request, res: Response): Promise<void> {
    const { productId, userId } = req.body
    if (!productId || !userId) {
      res.status(400).json({ error: 'Missing parameters' })
      return
    }
    const connectionResult = await this.paymentController.startIntentPayment(
      productId as string,
      userId as string
    )
    if (connectionResult === 'error') {
      res.status(400).json({ error: 'Error creating payment intent' })
    } else {
      res.status(200).json({ client_response: connectionResult })
    }
  }

  public async updateIntentPayment(req: Request, res: Response): Promise<void> {
    const { status, productId, currency, amount, intentId, userId } = req.body
    if (!intentId || !userId) {
      res.status(400).json({
        message: 'Some params missing'
      })
      return
    }
    await this.paymentController.updateIntentPayment(
      intentId as string,
      userId as string,
      status as string,
      productId as string,
      currency as string,
      amount as number
    )
    res.status(200).json({
      message: 'Data updated'
    })
  }
}
