/* eslint-disable @typescript-eslint/unbound-method */

import { Router } from 'express'
import { SQLRepository } from '../repository/sql'
import { PaymentCases } from '@/app/payment/cases'
import { PaymentController } from '../controller/payment_controller'
import { type Request, type Response } from 'express'

const paymentRouter = Router()

const paymentRepo = new SQLRepository()
const paymentCases = new PaymentCases(paymentRepo)
const paymentController = new PaymentController(paymentCases)

paymentRouter.post('/intent', paymentController.intentPayment)
paymentRouter.delete('/intents/all', paymentController.cancelIncompleteIntents)
paymentRouter.delete('/intents/:intentId', paymentController.cancelIncompleteIntentById)
paymentRouter.post('/webhook/success', (req: Request, res: Response) => {
  console.log('WebHook', req.body)
  res.status(200).send('ok')
})

export default paymentRouter
