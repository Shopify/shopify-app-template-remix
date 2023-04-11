import prisma from '../db.server.js'
import {app} from '../shopify/app.server.js'

export async function getToken(storeFQDN) {
  const storeToken = await prisma.tokens.findUnique({
    where: {
      storeFQDN,
    },
  })
  return storeToken?.token
}

export async function setToken(storeFQDN, token) {
  return prisma.tokens.create({data: {storeFQDN, token, scopes: app.api.scopes}})
}

export async function deleteToken(storeFQDN) {
  return prisma.tokens.delete({
    where: {
      storeFQDN,
    },
  })
}
