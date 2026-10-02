import { test } from '@japa/runner'
import User from '#models/user'
import Task from '#models/task'
import UserTransformer from '#transformers/user_transformer'
import TaskTransformer from '#transformers/task_transformer'
import { emptyDatabase } from '../helpers.js'

test.group('Transformers', (group) => {
  group.each.setup(() => {
    return emptyDatabase()
  })

  test('UserTransformer emits snake_case fields', async ({ assert }) => {
    const user = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    })

    const data = new UserTransformer(user).toObject()

    assert.equal(data.id, user.id)
    assert.equal(data.name, 'Jane Doe')
    assert.equal(data.email, 'jane@example.com')
    assert.includeMembers(Object.keys(data), ['id','name','email','created_at','updated_at','initials'])
    assert.notIncludeMembers(Object.keys(data), ['createdAt','updatedAt','password'])
  })

  test('UserTransformer handles array', async ({ assert }) => {
    const u1 = await User.create({ name: 'A', email: 'a@example.com', password: 'password123' })
    const u2 = await User.create({ name: 'B', email: 'b@example.com', password: 'password123' })
    const collection = UserTransformer.transform([u1, u2])
    const serialized = { data: [new UserTransformer(u1).toObject(), new UserTransformer(u2).toObject()] }

    assert.isArray(serialized.data)
    assert.lengthOf(serialized.data, 2)
    assert.includeMembers(Object.keys(serialized.data[0]), [
      'id',
      'name',
      'email',
      'created_at',
      'updated_at',
      'initials',
    ])
  })

  test('TaskTransformer emits snake_case fields and user_id', async ({ assert }) => {
    const user = await User.create({
      name: 'Owner',
      email: 'owner@example.com',
      password: 'password123',
    })

    const task = await Task.create({
      title: 'Test Task',
      description: 'Description here',
      status: 'in_progress',
      userId: user.id,
    })

    const data = new TaskTransformer(task).toObject()

    assert.equal(data.id, task.id)
    assert.equal(data.title, 'Test Task')
    assert.equal(data.description, 'Description here')
    assert.equal(data.status, 'in_progress')
    assert.equal(data.user_id, user.id)
    assert.exists(data.created_at)
    assert.exists(data.updated_at)
    assert.notIncludeMembers(Object.keys(data), ['createdAt', 'updatedAt', 'userId'])
  })

  test('TaskTransformer handles null/array correctly', async ({ assert }) => {
    const user = await User.create({
      name: 'T',
      email: 't@example.com',
      password: 'password123',
    })

    await Task.create({ title: 'T1', status: 'pending', userId: user.id })
    await Task.create({ title: 'T2', status: 'done', userId: user.id })

    const tasks = await Task.all(); const serialized = { data: tasks.map(t => new TaskTransformer(t).toObject()) }

    assert.isArray(serialized.data)
    assert.lengthOf(serialized.data, 2)
    assert.includeMembers(Object.keys(serialized.data[0]), [
      'id',
      'title',
      'description',
      'status',
      'user_id',
      'created_at',
      'updated_at',
    ])
  })
})
