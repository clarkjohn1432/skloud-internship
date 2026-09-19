# Backend Exercise 1

## Instructions

Create the backend **without using a database**.

Implement the following API endpoints:

```http
GET /students
GET /students/:id
POST /students
```

## Starting Data

Start with this array:

```typescript
const students = [
  { id: 1, name: 'Anna' },
  { id: 2, name: 'John' },
]
```

## Requirements

### `GET /students`

Returns all students.

### `GET /students/:id`

Returns the student whose `id` matches the provided URL parameter.

## Example:

```http
GET /students/1
```

Expected result:

```json
{
  "id": 1,
  "name": "Anna"
}
```

### `POST /students`

Receives a `name` from the request body.

Example request body:

```json
{
  "name": "Maria"
}
```

The new student should:

- Have a new unique `id`.
- Be added to the `students` array.
- Be returned in the response.

## Notes

- Do **not** use a database.
- Store the students in the provided array.
- The data will reset whenever the server restarts.
