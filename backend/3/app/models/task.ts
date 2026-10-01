import { TaskSchema } from '#database/schema'

export default class Task extends TaskSchema {
  /**
   * Narrows a query to the tasks owned by a single user. Used so that a user
   * can only ever list their own tasks.
   */
  static ownedBy(userId: number) {
    return this.query().where('userId', userId)
  }
}
