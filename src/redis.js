import { mapObject } from './utilities'

class RedisStore {
  constructor (client, HASH_KEY = 'axios-cache') {
    const invalidClientError = new TypeError(
      'WARN: First parameter must be a valid RedisClient instance.'
    )

    try {
      if (!(client.constructor.name === 'RedisClient' || client.constructor.name === 'Commander')) {
        throw invalidClientError
      }
    } catch (err) {
      if (typeof process && process.env.env === 'development') {
        console.debug(err)
      }
    }

    this.client = client
    this.HASH_KEY = HASH_KEY
  }

  async getItem (key) {
    const item = (await this.client.HGET(this.HASH_KEY, key)) || null

    return JSON.parse(item)
  }

  async setItem (key, value) {
    await this.client.HSET(this.HASH_KEY, key, JSON.stringify(value))

    return value
  }

  async removeItem (key) {
    await this.client.HDEL(this.HASH_KEY, key)
  }

  async clear () {
    return await this.client.DEL(this.HASH_KEY)
  }

  async length () {
    return await this.client.HLEN(this.HASH_KEY)
  }

  async iterate (fn) {
    const hashData = await this.client.HGETALL(this.HASH_KEY)
    return Promise.all(mapObject(hashData, fn))
  }
}

export default RedisStore
