import type Task from '#models/task'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    return {
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      status: this.resource.status,
      user_id: this.resource.userId,
      created_at: this.resource.createdAt,
      updated_at: this.resource.updatedAt,
    }
  }
}
