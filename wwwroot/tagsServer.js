export const getFakeDataFromServer = async () => {
  const response = await fetch('/api/mydata')
  const data = await response.json()
  const dbids = data.dbids

  return dbids
}
