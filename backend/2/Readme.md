# Task API

## Required Endpoints
```
GET    /tasks
GET    /tasks/:id
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
```
## Task Fields
```
id
title
description
status
created_at
updated_at
```


Requirements

Important: Need to have validation. invalid json should return bad request in the controller.

1. Migration

Create the appropriate database structure.

2. Model

Create/use the appropriate Lucid model.

3. index

Return all tasks.

4. show

Return one task.

5. store

Validate and create a task.

6. update

Update an existing task.

7. destroy

Delete an existing task.