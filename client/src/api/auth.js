import api from './axios'
import { unwrapData } from './apiHelpers'

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password })
  const data = unwrapData(response)
  const tokenPayload = data.token
  const accessToken =
    typeof tokenPayload === 'string' ? tokenPayload : tokenPayload?.token
  const tokenExp =
    typeof tokenPayload === 'object' && tokenPayload !== null
      ? tokenPayload.tokenExp
      : null

  return {
    user: data.user,
    accessToken,
    tokenExp,
  }
}
