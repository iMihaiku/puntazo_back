/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    authInfo?: any
    session_data?: any
  }
}
