import { test } from '@japa/runner'
import User from '#models/user'
import { emptyDatabase } from '../helpers.js'

test.group('User model', (group) => {
  group.each.setup(() => {
    return emptyDatabase()
  })

  test('computes initials from full name', async ({ assert }) => {
    const user = await User.create({
      name: 'Jane Marie Doe',
      email: 'jane@example.com',
      password: 'password123',
    })

    assert.equal(user.initials, 'JM')
  })

  test('computes initials from single name', async ({ assert }) => {
    const user = await User.create({
      name: 'Alicia',
      email: 'alicia@example.com',
      password: 'password123',
    })

    assert.equal(user.initials, 'AL')
  })

  test('computes initials from email when name is missing', async ({ assert }) => {
    const user = await User.create({
      name: '',
      email: 'bob@example.com',
      password: 'password123',
    })

    assert.equal(user.initials, 'BO')
  })

  test('computes initials from long email prefix', async ({ assert }) => {
    const user = await User.create({
      name: '',
      email: 'charles@example.com',
      password: 'password123',
    })

    assert.equal(user.initials, 'CH')
  })

  test('falls back to first two chars of first token', async ({ assert }) => {
    const user = await User.create({
      name: 'X',
      email: 'x@example.com',
      password: 'password123',
    })

    assert.equal(user.initials, 'X')
  })
})
