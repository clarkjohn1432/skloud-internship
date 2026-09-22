import router from '@adonisjs/core/services/router'

router.resource('tasks', '#controllers/tasks_controller').only(['index', 'show', 'store', 'update', 'destroy'])
