/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

/**
 * Public routes: registering and logging in do not require a token.
 */
router
  .group(() => {
    router.post('users', [controllers.Users, 'store'])
    router.post('sessions', [controllers.Sessions, 'store'])
  })
  .prefix('/api/v1')

/**
 * Protected routes: `middleware.auth()` rejects any request that does not
 * carry a valid `Authorization: Bearer <token>` header with a 401.
 */
router
  .group(() => {
    router.delete('sessions', [controllers.Sessions, 'destroy'])
    router.get('me', [controllers.Me, 'show'])

    router.get('tasks', [controllers.Tasks, 'index'])
    router.get('tasks/:id', [controllers.Tasks, 'show'])
    router.post('tasks', [controllers.Tasks, 'store'])
    router.patch('tasks/:id', [controllers.Tasks, 'update'])
    router.delete('tasks/:id', [controllers.Tasks, 'destroy'])
  })
  .prefix('/api/v1')
  .use(middleware.auth())
