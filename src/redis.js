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
        console.warn(err);
      }
    }

    this.client = client
    this.HASH_KEY = HASH_KEY

    // for node-redis, OR statements are for other clients like ioRedis, feel free to try them
    this.hgetAsync = client.hGet || client.HGET
    this.hsetAsync = client.hSet || client.HSET
    this.hdelAsync = client.hDel || client.HDEL
    this.delAsync = client.del || client.DEL
    this.hlenAsync = client.hLen || client.HLEN
    this.hgetallAsync = hGetAll || client.HGETALL
  }

  async getItem (key) {
    const item = (await this.hgetAsync(this.HASH_KEY, key)) || null

    return JSON.parse(item)
  }

  async setItem (key, value) {
    await this.hsetAsync(this.HASH_KEY, key, JSON.stringify(value))
    return value
  }

  async removeItem (key) {
    await this.hdelAsync(this.HASH_KEY, key)
  }

  async clear () {
    await this.delAsync(this.HASH_KEY)
  }

  async length () {
    return this.hlenAsync(this.HASH_KEY)
  }

  async iterate (fn) {
    const hashData = await this.hgetallAsync(this.HASH_KEY)
    return Promise.all(mapObject(hashData, fn))
  }
}

export default RedisStore
