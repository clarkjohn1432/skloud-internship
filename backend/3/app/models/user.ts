import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  get initials() {
    const name = this.name
    const email = this.email
    const trimmedName = name && name.trim() ? name.trim() : ''
    if (trimmedName) {
      const nameParts = trimmedName.split(/\s+/).filter(Boolean)
      if (nameParts.length >= 2) {
        const [first, second] = nameParts
        if (first && second) {
          return (first.charAt(0) + second.charAt(0)).toUpperCase()
        }
      }
      const first = nameParts[0]
      if (first && first.length >= 2) {
        return first.slice(0, 2).toUpperCase()
      }
      if (first) {
        return first.toUpperCase()
      }
    }
    const emailPart = email ? email.split('@')[0] : ''
    if (!emailPart) return ''
    return emailPart.length >= 2 ? emailPart.slice(0, 2).toUpperCase() : emailPart.toUpperCase()
  }
}
