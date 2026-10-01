import User from '#models/user'
import { errors } from '@adonisjs/auth'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class SessionsController {
  /**
   * Exchange credentials for an access token.
   */
  async store({ request, response, serialize }: HttpContext) {
    const [error, payload] = await request.tryValidateUsing(loginValidator)

    if (error || !payload) {
      return response.badRequest({
        message: 'Invalid credentials payload',
        errors: error?.messages ?? [],
      })
    }

    /**
     * `verifyCredentials` raises E_INVALID_CREDENTIALS when the email or the
     * password does not match. We turn that into a 401 ourselves, because
     * the framework default for that error is a 400.
     */
    const user = await User.verifyCredentials(payload.email, payload.password).catch((err) => {
      if (err instanceof errors.E_INVALID_CREDENTIALS) {
        return null
      }
      throw err
    })

    if (!user) {
      return response.unauthorized({ message: 'Invalid email or password' })
    }

    const token = await User.accessTokens.create(user)

    return response.ok(
      await serialize({
        user: UserTransformer.transform(user),
        token: token.value!.release(),
      })
    )
  }

  /**
   * Revoke the access token used for the current request (logout).
   */
  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}
