/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'


const students = [
  { id: 1, name: 'Anna'},
  { id: 2, name: 'John'},
]

router.get('/students', () =>{
  return students
})

router.get('/students/:id', ({ params, response}) =>{

  const student = students.find((student) => student.id === Number(params.id))

  if(!student) {
    return response.status(404).send({ message: 'Student not found'})
  }

  return student
})

router.post('/students', ({ request, response}) => {
  const { name } = request.body()

  const id = students.length + 1
  const newStudent = {id, name}
  students.push(newStudent)

  return response.status(201).send(newStudent)
})
