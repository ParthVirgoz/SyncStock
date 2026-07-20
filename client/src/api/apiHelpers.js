export function unwrapData(response) {
  return response.data?.data ?? response.data
}

export function unwrapMessage(response) {
  return response.data?.message
}
