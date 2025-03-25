import { type UserCases } from '@/app/user/cases'

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env

export async function validateToken(
  userId: string,
  userCases: UserCases
): Promise<boolean> {
  const token = await userCases.getTokenByUserId(userId)
  const url = `https://graph.facebook.com/debug_token?
  input_token=${token.token_value}&
  access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
  const response = await fetch(url)
  const data = (await response.json()) as any
  return data.data?.is_valid
}
