import { test } from '@japa/runner'
import User from '#models/user'
import { emptyDatabase } from '../helpers.js'

test.group('Me', (group) => {
  group.each.setup(() => {
    return emptyDatabase()
  })

  test('returns the authenticated user', async ({ client }) => {
    const user = await User.create({
      name: 'Me',
      email: 'me@example.com',
      password: 'password123',
    })

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: user.id,
        name: 'Me',
        email: 'me@example.com',
      },
    })
  })

  test('never leaks the password', async ({ client }) => {
    const user = await User.create({
      name: 'Secret',
      email: 'secret@example.com',
      password: 'password123',
    })

    const response = await client.get('/api/v1/me').loginAs(user)

    response.assertBodyNotContains({ password: 'password123' })
  })

  test('returns 401 when no authorization header is provided', async ({ client }) => {
    await User.create({
      name: 'Nobody',
      email: 'nobody@example.com',
      password: 'password123',
    })

    const response = await client.get('/api/v1/me')

    response.assertStatus(401)
  })

  test('returns 401 when the token is invalid', async ({ client }) => {
    const response = await client
      .get('/api/v1/me')
      .header('Authorization', 'Bearer definitely-not-a-valid-token')

    response.assertStatus(401)
  })
})
