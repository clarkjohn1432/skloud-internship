import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class UsersController {
  /**
   * Register a new user.
   *
   * No access token is issued here - the client must log in through
   * POST /api/v1/sessions to get one.
   */
  async store({ request, response, serialize }: HttpContext) {
    const [error, payload] = await request.tryValidateUsing(signupValidator)

    if (error || !payload) {
      return response.badRequest({
        message: 'Invalid user payload',
        errors: error?.messages ?? [],
      })
    }

    // `passwordConfirmation` only exists to validate the request, it is not
    // a column on the users table, so we drop it before saving.
    const { passwordConfirmation, ...attributes } = payload

    // The password is hashed automatically by the `withAuthFinder` hook.
    const user = await User.create(attributes)

    return response.created(await serialize(UserTransformer.transform(user)))
  }
}
