import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      created_at: this.resource.createdAt,
      updated_at: this.resource.updatedAt,
      initials: this.resource.initials,
    }
  }
}
