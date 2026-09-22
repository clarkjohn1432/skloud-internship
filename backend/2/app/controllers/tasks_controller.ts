import Task from '#models/task'
import { storeValidator, updateValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'

export default class TasksController {
  async index({ response }: HttpContext) {
    const tasks = await Task.all()
    return response.ok(tasks)
  }

  async show({ params, response }: HttpContext) {
    const task = await Task.find(params.id)
    if (!task) {
      return response.notFound({ message: 'Task not found' })
    }
    return response.ok(task)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(storeValidator)
    const task = await Task.create(payload)
    return response.created(task)
  }

  async update({ params, request, response }: HttpContext) {
    const task = await Task.find(params.id)
    if (!task) {
      return response.notFound({ message: 'Task not found' })
    }
    const payload = await request.validateUsing(updateValidator)
    task.merge(payload)
    await task.save()
    return response.ok(task)
  }

  async destroy({ params, response }: HttpContext) {
    const task = await Task.find(params.id)
    if (!task) {
      return response.notFound({ message: 'Task not found' })
    }
    await task.delete()
    return response.noContent()
  }
}
