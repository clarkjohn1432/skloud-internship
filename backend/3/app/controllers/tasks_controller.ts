import Task from '#models/task'
import { DEFAULT_TASK_STATUS, storeValidator, updateValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'

/**
 * Drops every key whose value is `undefined`.
 *
 * VineJS sets the optional fields that were not sent to `undefined`. If we
 * passed those straight to the model, Lucid would write NULL over them
 * instead of leaving the column alone (or letting its default apply).
 *
 * A `null` sent on purpose - to clear the description - is kept.
 */
function removeUndefined(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined))
}

export default class TasksController {
  /**
   * Return every task belonging to the authenticated user.
   */
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    const tasks = await Task.ownedBy(user.id).orderBy('id')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * Return a single task owned by the authenticated user.
   */
  async show({ auth, params, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const task = await Task.find(params.id)

    if (!task) {
      return response.notFound({ message: 'Task not found' })
    }

    if (task.userId !== user.id) {
      return response.forbidden({ message: 'You cannot access this task' })
    }

    return serialize(TaskTransformer.transform(task))
  }

  /**
   * Create a task owned by the authenticated user.
   */
  async store({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const [error, payload] = await request.tryValidateUsing(storeValidator)

    if (error || !payload) {
      return response.badRequest({
        message: 'Invalid task payload',
        errors: error?.messages ?? [],
      })
    }

    const { title, description, status } = payload

    const task = await Task.create({
      title,
      // Fall back to the defaults for whatever the client left out.
      description: description ?? null,
      status: status ?? DEFAULT_TASK_STATUS,
      userId: user.id,
    })

    return response.created(await serialize(TaskTransformer.transform(task)))
  }

  /**
   * Update a task owned by the authenticated user.
   */
  async update({ auth, params, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const task = await Task.find(params.id)

    if (!task) {
      return response.notFound({ message: 'Task not found' })
    }

    if (task.userId !== user.id) {
      return response.forbidden({ message: 'You cannot modify this task' })
    }

    const [error, payload] = await request.tryValidateUsing(updateValidator)

    if (error || !payload) {
      return response.badRequest({
        message: 'Invalid task payload',
        errors: error?.messages ?? [],
      })
    }

    /**
     * A PATCH must only touch the fields that were actually sent.
     */
    task.merge(removeUndefined(payload))
    await task.save()

    return serialize(TaskTransformer.transform(task))
  }

  /**
   * Delete a task owned by the authenticated user.
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const task = await Task.find(params.id)

    if (!task) {
      return response.notFound({ message: 'Task not found' })
    }

    if (task.userId !== user.id) {
      return response.forbidden({ message: 'You cannot delete this task' })
    }

    await task.delete()

    return response.noContent()
  }
}
