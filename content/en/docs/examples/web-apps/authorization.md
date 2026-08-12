---
title: App with Authorization
description: Build a small tasks API with API-key authorization, permissions, and a policy.
---

In this example, we will build a small tasks app. A user can read their own tasks, while an admin can read any user's tasks and view reports.

Project structure:

```text
app/
  controllers/
    tasks.py
  security.py
main.py
```

## main.py

`main.py` creates the application. `app.security` is imported explicitly because it contains the security configuration and policy. Controllers are loaded with `discover`.

```python
from autumn import Autumn

import app.security
import uvicorn

app = Autumn(
    discover = 'app.controllers'
)

if __name__ == '__main__':
    uvicorn.run(app)
```

## app/security.py

For the example, use a mocked user store and `APIKey`.

```python
from autumn.security import APIKey, Principal, SecurityConfiguration, policy

USERS = {
    'user-key': Principal(
        id = 'user-1',
        scheme = 'api-key',
        claims = { 'name': 'Demo User' },
        roles = { 'user' },
        permissions = { 'tasks:read' }
    ),
    'admin-key': Principal(
        id = 'admin',
        scheme = 'api-key',
        claims = { 'name': 'Demo Admin' },
        roles = { 'admin', 'user' },
        permissions = { 'tasks:read', 'reports:read' }
    )
}

async def load_principal(api_key: str) -> Principal | None:
    return USERS.get(api_key)

class Security(SecurityConfiguration):
    schemes = (
        APIKey(load_principal, name = 'taskApiKey', header = 'X-API-Key'),
    )

@policy('same_user_or_admin')
async def same_user_or_admin(principal: Principal, user_id: str) -> bool:
    return principal.id == user_id or 'admin' in principal.roles
```

## app/controllers/tasks.py

The controller is protected with `@authenticated`, so every method inside requires a valid API key. Individual routes add more specific rules.

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse
from autumn.security import Principal, authenticated, permissions, public, requires

TASKS = {
    'user-1': [
        { 'id': 1, 'title': 'Write Autumn app' },
        { 'id': 2, 'title': 'Check security docs' }
    ],
    'admin': [
        { 'id': 3, 'title': 'Review reports' }
    ]
}

@REST(prefix = '/tasks')
@authenticated
class TasksController:
    @get('/me')
    async def my_tasks(self, principal: Principal) -> JSONResponse:
        return JSONResponse({
            'user'  : principal.id,
            'tasks' : TASKS.get(principal.id, [])
        })

    @get('/users/{user_id:str}')
    @requires('same_user_or_admin')
    async def user_tasks(self, principal: Principal, user_id: str) -> JSONResponse:
        return JSONResponse({
            'viewer' : principal.id,
            'user'   : user_id,
            'tasks'  : TASKS.get(user_id, [])
        })

    @get('/reports')
    @permissions('reports:read')
    async def reports(self, principal: Principal) -> JSONResponse:
        return JSONResponse({
            'viewer' : principal.id,
            'total'  : sum(len(tasks) for tasks in TASKS.values())
        })

    @get('/public')
    @public
    async def public_status(self, principal: Principal) -> JSONResponse:
        return JSONResponse({
            'authenticated' : principal.authenticated,
            'message'       : 'Use X-API-Key to access protected routes.'
        })
```

## Try It

The public route is open:

```bash
curl http://127.0.0.1:8000/tasks/public
```

The protected route without a key returns `401`:

```bash
curl http://127.0.0.1:8000/tasks/me
```

A regular user can read their own tasks:

```bash
curl -H "X-API-Key: user-key" http://127.0.0.1:8000/tasks/me
```

They can access their own user route through the policy:

```bash
curl -H "X-API-Key: user-key" http://127.0.0.1:8000/tasks/users/user-1
```

But they cannot access another user's tasks:

```bash
curl -H "X-API-Key: user-key" http://127.0.0.1:8000/tasks/users/admin
```

That request returns `403`.

The admin passes the policy:

```bash
curl -H "X-API-Key: admin-key" http://127.0.0.1:8000/tasks/users/user-1
```

And can read reports:

```bash
curl -H "X-API-Key: admin-key" http://127.0.0.1:8000/tasks/reports
```

## What Happens

`APIKey` reads the key from `X-API-Key` and turns it into a `Principal`. `@authenticated` checks that a user exists. `@permissions` checks a specific permission. `@requires('same_user_or_admin')` calls a policy that decides access using the `user_id` path parameter.

The example uses mocked data, but the shape stays the same with a database: the loader can call a user service, and the policy can receive services through DI to check resource ownership.
