import { type Request, type Response } from 'express'
import { type UserCases } from '@/app/user/cases'
import { type TokenEntity } from '@/domain/user/entity'
import { generateJWT } from '@/lib/jwt'
import { nanoid } from 'nanoid'

interface UserFacebookDTO {
  id: string
  name: string
  email: string
  picture: string
}
const {
  AUTH_RESPONSE_URL,
  FACEBOOK_APP_ID,
  FACEBOOK_URL_AUTH,
  FACEBOOK_URL_ACCESS,
  FACEBOOK_APP_SECRET,
  REDIRECT_URI_FACEBOOK,
  FACEBOOK_URL_INFO_USER
} = process.env

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

export async function oauthFacebook(
  req: Request,
  res: Response
): Promise<void> {
  const facebookAuthURL = `${FACEBOOK_URL_AUTH}?client_id=${FACEBOOK_APP_ID}&redirect_uri=${DOMAIN_SERVER_URI}${REDIRECT_URI_FACEBOOK}&scope=email,public_profile`
  res.status(200).json({ url: facebookAuthURL })
}

export async function callbackOAuthFacebook(
  req: Request,
  res: Response,
  userCases: UserCases
): Promise<void> {
  const { code = '' } = req.query
  if (!code) {
    res.status(400).json({ error: 'No authorization code provided' })
    return
  }

  const shortAccessToken = await getShortAccessToken(code as string)
  if (!shortAccessToken) {
    res.status(500).json({ error: 'Error getting the accessToken' })
    return
  }

  const userData = await getFacebookUserInfo(shortAccessToken)
  console.log(userData)
  if (userData === null) {
    res.status(500).json({ error: 'Error getting user info from facebook' })
    return
  }

  let tokenInfoBBDD
  const userOnBBDD = await userCases.getUserByUserId(userData.id)
  if (userOnBBDD) {
    tokenInfoBBDD = await userCases.getTokenByUserId(userOnBBDD.id)
    if (tokenInfoBBDD) {
      const isValidLongToken = await validateLongLivedToken(
        tokenInfoBBDD.token_value
      )
      if (!isValidLongToken) {
        const longLivedToken = await getLongAccessToken(shortAccessToken)
        if (longLivedToken === null) {
          return
        }
        await userCases.updateToken(longLivedToken, userData.id)
      }
    }
  } else {
    const longLivedToken = await getLongAccessToken(shortAccessToken)
    if (longLivedToken === null) {
      return
    }
    const newToken: TokenEntity = {
      id: userData.id,
      token_name: 'long_lived_facebook',
      token_value: longLivedToken
    }
    await userCases.createUser(
      userData.name,
      userData.email,
      'oauth-facebook',
      newToken,
      userData.id
    )
  }
  const sessionId = nanoid(15)
  await userCases.updateSession(userData.id, sessionId)
  const jwtToken = generateJWT(
    userData.id,
    userData.name,
    userData.email,
    sessionId
  )
  res.cookie('session_token', jwtToken, {
    httpOnly: true,
    secure: true,
    maxAge: 3600 * 1000 * 4
  })
  let domainResponse = req.headers.host
  if (domainResponse?.includes('localhost')) {
    domainResponse = 'http://' + domainResponse
  } else {
    domainResponse = 'https://' + domainResponse
  }
  res.redirect(`${DOMAIN_URI}${AUTH_RESPONSE_URL}?state=succeded`)
}

/**
 * Funciones privadas de clase
 */

async function getShortAccessToken(code: string): Promise<string | null> {
  try {
    const tokenResponse = await fetch(
      `${FACEBOOK_URL_ACCESS}?
      client_id=${FACEBOOK_APP_ID}&
      client_secret=${FACEBOOK_APP_SECRET}&
      redirect_uri=${DOMAIN_SERVER_URI}${REDIRECT_URI_FACEBOOK}&
      code=${code}`,
      { method: 'GET' }
    )
    const tokenData = (await tokenResponse.json()) as any
    const accessToken = tokenData.access_token

    return accessToken
  } catch (error) {
    console.log(error)
    return null
  }
}

async function getFacebookUserInfo(
  shortAccessToken: string
): Promise<UserFacebookDTO | null> {
  try {
    const userResponse = await fetch(
      `${FACEBOOK_URL_INFO_USER}?fields=id,name,email,picture&access_token=${shortAccessToken}`,
      { method: 'GET' }
    )
    const userData: UserFacebookDTO =
      (await userResponse.json()) as UserFacebookDTO
    return userData
  } catch (error) {
    console.log(error)
    return null
  }
}

async function getLongAccessToken(
  shortAccessToken: string
): Promise<string | null> {
  try {
    const longLivedResponse = await fetch(
      `${FACEBOOK_URL_ACCESS}?
      grant_type=fb_exchange_token&
      client_id=${FACEBOOK_APP_ID}&
      client_secret=${FACEBOOK_APP_SECRET}&
      fb_exchange_token=${shortAccessToken}`,
      { method: 'GET' }
    )
    const longLivedToken = (await longLivedResponse.json()) as {
      access_token: string
      token_type: string
      expires_in: number
    }
    return longLivedToken.access_token
  } catch (error) {
    console.log(error)
    return null
  }
}
async function validateLongLivedToken(
  longLivedToken: string
): Promise<boolean> {
  try {
    const appAccessToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
    const url = `https://graph.facebook.com/debug_token?input_token=${longLivedToken}&access_token=${appAccessToken}`

    const response = await fetch(url)
    const data = (await response.json()) as { data: { is_valid: boolean } }
    return data.data.is_valid
  } catch (error) {
    console.log(error)
    return false
  }
}
