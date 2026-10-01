import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class MeController {
  /**
   * Return the currently authenticated user.
   *
   * The route is behind `middleware.auth()`, so a user is guaranteed to be
   * present by the time this runs.
   */
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    return serialize(UserTransformer.transform(user))
  }
}
