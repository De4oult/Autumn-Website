---
title: Приложение с авторизацией
description: Соберите маленький API для задач с API-key авторизацией, ролями и policy.
---

В этом примере сделаем небольшое приложение для задач. Пользователь сможет смотреть свои задачи, а администратор - смотреть задачи любого пользователя и читать отчеты.

Структура:

```text
app/
  controllers/
    tasks.py
  security.py
main.py
```

## main.py

`main.py` создает приложение. Модуль `app.security` импортируется явно, потому что в нем лежат конфигурация security и policy. Контроллеры подключаются через `discover`.

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

Для примера используем моковую базу пользователей и `APIKey`.

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

Контроллер закрыт декоратором `@authenticated`: все методы внутри требуют валидный API key. Для отдельных маршрутов добавляем более точные правила.

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

## Проверка

Публичный маршрут открыт:

```bash
curl http://127.0.0.1:8000/tasks/public
```

Защищенный маршрут без ключа вернет `401`:

```bash
curl http://127.0.0.1:8000/tasks/me
```

Обычный пользователь видит свои задачи:

```bash
curl -H "X-API-Key: user-key" http://127.0.0.1:8000/tasks/me
```

Он может открыть свой профиль задач через policy:

```bash
curl -H "X-API-Key: user-key" http://127.0.0.1:8000/tasks/users/user-1
```

Но не может открыть чужие задачи:

```bash
curl -H "X-API-Key: user-key" http://127.0.0.1:8000/tasks/users/admin
```

Этот запрос вернет `403`.

Администратор проходит policy:

```bash
curl -H "X-API-Key: admin-key" http://127.0.0.1:8000/tasks/users/user-1
```

И может читать отчеты:

```bash
curl -H "X-API-Key: admin-key" http://127.0.0.1:8000/tasks/reports
```

## Что здесь происходит

`APIKey` достает ключ из `X-API-Key` и превращает его в `Principal`. `@authenticated` проверяет, что пользователь найден. `@permissions` проверяет конкретное право. `@requires('same_user_or_admin')` вызывает policy, которая решает доступ по path-параметру `user_id`.

Такой пример пока использует моковые данные, но форма останется той же для базы данных: loader может пойти в сервис пользователей, а policy - принять сервис через DI и проверить владение ресурсом.
