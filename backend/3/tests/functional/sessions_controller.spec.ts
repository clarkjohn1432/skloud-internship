import { test } from '@japa/runner'
import User from '#models/user'
import { emptyDatabase } from '../helpers.js'

test.group('Sessions', (group) => {
  group.each.setup(() => {
    return emptyDatabase()
  })

  test('issues an access token on successful login', async ({ client, assert }) => {
    await User.create({
      name: 'Tester',
      email: 'tester@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/v1/sessions').json({
      email: 'tester@example.com',
      password: 'password123',
    })

    response.assertStatus(200)

    const body = response.body() as { data: { token: string; user: { name: string } } }
    assert.isString(body.data.token)
    assert.isNotEmpty(body.data.token)
    assert.equal(body.data.user.name, 'Tester')
  })

  test('the issued token can be used to authenticate', async ({ client }) => {
    await User.create({
      name: 'Tester',
      email: 'reuse@example.com',
      password: 'password123',
    })

    const login = await client.post('/api/v1/sessions').json({
      email: 'reuse@example.com',
      password: 'password123',
    })

    const body = login.body() as { data: { token: string } }

    const response = await client
      .get('/api/v1/me')
      .header('Authorization', `Bearer ${body.data.token}`)

    response.assertStatus(200)
  })

  test('rejects login with an incorrect password', async ({ client }) => {
    await User.create({
      name: 'Tester',
      email: 'wrong-password@example.com',
      password: 'password123',
    })

    const response = await client.post('/api/v1/sessions').json({
      email: 'wrong-password@example.com',
      password: 'nope-not-it',
    })

    response.assertStatus(401)
  })

  test('rejects login without a password', async ({ client }) => {
    const response = await client
      .post('/api/v1/sessions')
      .unsafeJson({ email: 'tester@example.com' })

    response.assertStatus(400)
  })

  test('revokes the token on logout', async ({ client }) => {
    await User.create({
      name: 'Tester',
      email: 'logout@example.com',
      password: 'password123',
    })

    const login = await client.post('/api/v1/sessions').json({
      email: 'logout@example.com',
      password: 'password123',
    })

    const body = login.body() as { data: { token: string } }

    const logout = await client
      .delete('/api/v1/sessions')
      .header('Authorization', `Bearer ${body.data.token}`)

    logout.assertStatus(200)

    // The revoked token must no longer be accepted.
    const meResponse = await client
      .get('/api/v1/me')
      .header('Authorization', `Bearer ${body.data.token}`)

    meResponse.assertStatus(401)
  })
})
