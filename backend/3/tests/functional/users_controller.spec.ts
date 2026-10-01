import { test } from '@japa/runner'
import User from '#models/user'
import { emptyDatabase } from '../helpers.js'

test.group('Users', (group) => {
  group.each.setup(() => {
    return emptyDatabase()
  })

  test('registers a new user', async ({ client, assert }) => {
    const response = await client.post('/api/v1/users').json({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      data: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
    })

    const user = await User.findBy('email', 'jane@example.com')
    assert.exists(user)
    assert.equal(user?.name, 'Jane Doe')
  })

  test('rejects registration without a name', async ({ client }) => {
    // `unsafeJson` lets us send a body the generated client types forbid,
    // which is exactly the kind of request a real client can make.
    const response = await client.post('/api/v1/users').unsafeJson({
      email: 'missing-name@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertStatus(400)
  })

  test('rejects registration with a blank name', async ({ client }) => {
    const response = await client.post('/api/v1/users').json({
      name: '   ',
      email: 'blank-name@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertStatus(400)
  })

  test('rejects registration with an invalid email', async ({ client }) => {
    const response = await client.post('/api/v1/users').unsafeJson({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'password123',
      passwordConfirmation: 'password123',
    })

    response.assertStatus(400)
  })

  test('rejects duplicate email', async ({ client }) => {
    const payload = {
      name: 'First',
      email: 'duplicate@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    }

    await client.post('/api/v1/users').json(payload)

    const response = await client.post('/api/v1/users').json({
      ...payload,
      name: 'Second',
    })

    response.assertStatus(400)
  })
})
