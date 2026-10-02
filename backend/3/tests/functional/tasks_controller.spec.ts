import { test } from '@japa/runner'
import User from '#models/user'
import Task from '#models/task'
import { emptyDatabase } from '../helpers.js'

test.group('Tasks', (group) => {
  group.each.setup(() => {
    return emptyDatabase()
  })

  /**
   * Registers a user directly in the database. Every test builds the users
   * it needs so that tests never share state.
   */
  async function createUser(email: string, name = 'Test User') {
    return User.create({ name, email, password: 'password123' })
  }

  test('creates a task for the authenticated user', async ({ client }) => {
    const user = await createUser('creator@example.com')

    const response = await client.post('/tasks').loginAs(user).json({
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      status: 'pending',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      data: {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        status: 'pending',
        user_id: user.id,
      },
    })
  })

  test('defaults status to pending and description to null', async ({ client }) => {
    const user = await createUser('defaults@example.com')

    const response = await client
      .post('/tasks')
      .loginAs(user)
      .unsafeJson({ title: 'Only a title' })

    response.assertStatus(201)
    response.assertBodyContains({
      data: {
        title: 'Only a title',
        status: 'pending',
        description: null,
      },
    })
  })

  test('lists only the authenticated users tasks', async ({ client, assert }) => {
    const alice = await createUser('alice-list@example.com', 'Alice')
    const bob = await createUser('bob-list@example.com', 'Bob')

    await Task.create({ title: 'Alice Task 1', status: 'pending', userId: alice.id })
    await Task.create({ title: 'Alice Task 2', status: 'in_progress', userId: alice.id })
    await Task.create({ title: 'Bob Task', status: 'pending', userId: bob.id })

    const response = await client.get('/tasks').loginAs(alice)

    response.assertStatus(200)

    const body = response.body() as { data: { title: string }[] }
    assert.lengthOf(body.data, 2)
    assert.deepEqual(
      body.data.map((task) => task.title),
      ['Alice Task 1', 'Alice Task 2']
    )
  })

  test('shows a task owned by the user', async ({ client }) => {
    const user = await createUser('shower@example.com')

    const task = await Task.create({
      title: 'Important',
      description: 'Very important',
      status: 'pending',
      user_id: user.id,
    })

    const response = await client.get(`/tasks/${task.id}`).loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      data: { id: task.id, title: 'Important' },
    })
  })

  test('forbids showing another users task', async ({ client }) => {
    const alice = await createUser('alice-show@example.com')
    const bob = await createUser('bob-show@example.com')

    const task = await Task.create({ title: 'Private', status: 'pending', userId: alice.id })

    const response = await client.get(`/tasks/${task.id}`).loginAs(bob)

    response.assertStatus(403)
  })

  test('updates a task owned by the user', async ({ client }) => {
    const user = await createUser('updater@example.com')

    const task = await Task.create({
      title: 'To Update',
      description: 'Old description',
      status: 'pending',
      user_id: user.id,
    })

    const response = await client.patch(`/tasks/${task.id}`).loginAs(user).json({
      title: 'Updated Title',
      status: 'done',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        id: task.id,
        title: 'Updated Title',
        status: 'done',
        // Fields that were not sent are left untouched.
        description: 'Old description',
      },
    })
  })

  test('forbids updating another users task', async ({ client, assert }) => {
    const alice = await createUser('alice-update@example.com')
    const bob = await createUser('bob-update@example.com')

    const task = await Task.create({ title: 'Not Yours', status: 'pending', userId: alice.id })

    const response = await client.patch(`/tasks/${task.id}`).loginAs(bob).json({
      status: 'done',
    })

    response.assertStatus(403)

    // The task must be left exactly as it was.
    const untouched = await Task.find(task.id)
    assert.equal(untouched?.status, 'pending')
  })

  test('deletes a task owned by the user', async ({ client, assert }) => {
    const user = await createUser('deleter@example.com')

    const task = await Task.create({ title: 'To Delete', status: 'pending', user_id: user.id })

    const response = await client.delete(`/tasks/${task.id}`).loginAs(user)

    response.assertStatus(204)
    assert.isNull(await Task.find(task.id))
  })

  test('forbids deleting another users task', async ({ client, assert }) => {
    const alice = await createUser('alice-delete@example.com')
    const bob = await createUser('bob-delete@example.com')

    const task = await Task.create({ title: 'Keep me', status: 'pending', userId: alice.id })

    const response = await client.delete(`/tasks/${task.id}`).loginAs(bob)

    response.assertStatus(403)
    assert.exists(await Task.find(task.id))
  })

  test('returns 404 for a task that does not exist', async ({ client }) => {
    const user = await createUser('ghost@example.com')

    const response = await client.get('/tasks/9999').loginAs(user)

    response.assertStatus(404)
  })

  test('rejects an invalid payload on create', async ({ client }) => {
    const user = await createUser('invalid-create@example.com')

    const responses = await Promise.all([
      // Blank title.
      client.post('/tasks').loginAs(user).unsafeJson({ title: '   ' }),
      // Unknown status.
      client
        .post('/tasks')
        .loginAs(user)
        .unsafeJson({ title: 'Valid', status: 'not-a-status' }),
      // Wrong type for title.
      client.post('/tasks').loginAs(user).unsafeJson({ title: 42 }),
    ])

    responses.forEach((response) => response.assertStatus(400))
  })

  test('rejects an invalid payload on update', async ({ client }) => {
    const user = await createUser('invalid-update@example.com')

    const task = await Task.create({ title: 'Valid', status: 'pending', user_id: user.id })

    const response = await client
      .patch(`/tasks/${task.id}`)
      .loginAs(user)
      .unsafeJson({ status: 'archived' })

    response.assertStatus(400)
  })

  test('requires authentication on every task route', async ({ client, assert }) => {
    const user = await createUser('auth-check@example.com')
    const task = await Task.create({ title: 'Guarded', status: 'pending', user_id: user.id })

    const responses = await Promise.all([
      client.get('/tasks'),
      client.post('/tasks').json({ title: 'Nope', status: 'pending' }),
      client.get(`/tasks/${task.id}`),
      client.patch(`/tasks/${task.id}`).json({ status: 'done' }),
      client.delete(`/tasks/${task.id}`),
    ])

    responses.forEach((response) => response.assertStatus(401))

    // Nothing was touched while the requests were unauthenticated.
    assert.lengthOf(await Task.all(), 1)
  })
})
