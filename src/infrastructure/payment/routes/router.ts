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

paymentRouter.put('/intent', paymentController.updateIntentPayment)
paymentRouter.post('/intent', paymentController.startIntentPayment)

paymentRouter.delete('/intent/all', paymentController.cancelIncompleteIntents)
paymentRouter.delete('/intent/:intentId', paymentController.cancelIncompleteIntentById)

paymentRouter.post('/webhook/transfer/updateStatus', (req: Request, res: Response) => {
  console.log('WebHook', req.body)
  res.status(200).send('ok')
})
paymentRouter.post('/webhook/payment/success', (req: Request, res: Response) => {
  console.log('WebHook', req.body)
  res.status(200).send('ok')
})
export default paymentRouter
