import { type Request, type Response } from 'express'
import { google } from 'googleapis'
import { type Credentials, OAuth2Client } from 'google-auth-library'
import { generateJWT } from '@/lib/jwt'
import { type UserCases } from '@/app/user/cases'

let DOMAIN_URI: string
let DOMAIN_SERVER_URI: string

switch (process.env.NODE_ENV) {
  case 'production':
    DOMAIN_URI = process.env.DOMAIN_URI_PRO!
    DOMAIN_SERVER_URI = process.env.DOMAIN_SERVER_URI_PRO!
    break
  case 'preproduction':
    DOMAIN_URI = process.env.DOMAIN_URI_PRE!
    DOMAIN_SERVER_URI = process.env.DOMAIN_SERVER_URI_PRE!
    break
  case 'development':
  default:
    DOMAIN_URI = process.env.DOMAIN_URI_DEV!
    DOMAIN_SERVER_URI = process.env.DOMAIN_SERVER_URI_DEV!
    break
}
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, AUTH_RESPONSE_URL } =
  process.env
const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  DOMAIN_SERVER_URI + REDIRECT_URI
)
const oauth2 = google.oauth2('v2')

export async function oauthGoogle(req: Request, res: Response): Promise<void> {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    include_granted_scopes: true,
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  })
  res.status(200).json({ url: authUrl })
}

export async function callbackOAuthGoogle(
  req: Request,
  res: Response,
  userCases: UserCases
): Promise<void> {
  const code = req.query.code?.toString() ?? ''
  if (!code) {
    res.status(400).json({ error: 'No authorization code provided' })
    return
  }
  const { userData, tokens } = (await getGoogleOAuthInfo(code)) as {
    userData: {
      id: string
      name: string
      email: string
    }
    tokens: Credentials
  }
  const userBBDD = await userCases.getUserByUserId(userData.id)
  if (!userBBDD) {
    if (!tokens.refresh_token) {
      await revokeGoogleToken(tokens.access_token!)
      res.redirect(`${DOMAIN_URI}${AUTH_RESPONSE_URL}?state=failed`)
      return
    } else {
      await userCases.callbackOAuthGoogle(userData, tokens.refresh_token)
    }
  } else {
    if (tokens.refresh_token) {
      await userCases.updateToken(tokens.refresh_token, userData.id)
    }
  }
  const jwtToken = generateJWT(userData.id, userData.name, userData.email)
  res.cookie('session_token', jwtToken, {
    httpOnly: true,
    secure: true,
    maxAge: 3600 * 1000
  })

  res.redirect(`${DOMAIN_URI}${AUTH_RESPONSE_URL}?state=succeded`)
}

export async function revokeGoogleToken(accessToken: string): Promise<void> {
  const response = await fetch(
    'https://oauth2.googleapis.com/revoke?token=' + accessToken,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  )
  console.log(await response.json())
}

async function getGoogleOAuthInfo(code: string): Promise<{
  userData: any
  tokens: Credentials
}> {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    const userInfo = await oauth2.userinfo.get({ auth: oauth2Client })
    const userData = userInfo.data

    return { userData, tokens }
  } catch (err) {
    console.error(err)
    throw new Error('Error getting Google OAuth info')
  }
}
