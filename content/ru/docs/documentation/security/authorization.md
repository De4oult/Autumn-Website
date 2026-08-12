---
title: Авторизация
description: Подключите аутентификацию, роли, permissions и политики доступа прямо в Autumn.
---

Autumn Security добавляет в приложение общий способ понять, кто делает запрос, и решить, можно ли ему вызвать маршрут.

Основные части:

- `Principal` - текущий пользователь или сервисный субъект;
- `SecurityConfiguration` - список схем аутентификации;
- `APIKey` и `JWTBearer` - встроенные схемы;
- `@authenticated`, `@roles`, `@permissions`, `@requires` и `@public` - требования доступа на контроллерах и методах;
- `@policy` - именованное правило, которое может использовать DI.

## Principal

`Principal` описывает текущего пользователя.

```python
from autumn.security import Principal

principal = Principal(
    id = 'user-1',
    scheme = 'api-key',
    claims = { 'name': 'Dima' },
    roles = { 'admin' },
    permissions = { 'users:read', 'users:write' }
)
```

В обработчиках его можно принимать как обычную dependency.

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse
from autumn.security import Principal, authenticated

@REST(prefix = '/account')
@authenticated
class AccountController:
    @get('/me')
    async def me(self, principal: Principal) -> JSONResponse:
        return JSONResponse({
            'id'    : principal.id,
            'roles' : sorted(principal.roles)
        })
```

На публичных маршрутах `Principal` тоже доступен, но будет anonymous:

```python
principal.authenticated == False
```

## SecurityConfiguration

Схемы аутентификации подключаются через наследника `SecurityConfiguration`.

```python
from autumn.security import APIKey, Principal, SecurityConfiguration

USERS = {
    'admin-key': Principal(
        id = 'admin',
        scheme = 'api-key',
        roles = { 'admin' },
        permissions = { 'users:read' }
    )
}

async def load_principal(api_key: str) -> Principal | None:
    return USERS.get(api_key)

class MySecurityConfiguration(SecurityConfiguration):
    schemes = (
        APIKey(load_principal, header = 'X-API-Key'),
    )
```

`APIKey` берет значение из заголовка и передает его в loader. Если loader вернул `Principal`, запрос считается аутентифицированным. Если вернул `None`, Autumn пробует следующую схему или отвечает `401` на защищенном маршруте.

## JWTBearer

Для JWT можно использовать `JWTBearer`.

```python
from autumn.security import JWTBearer, SecurityConfiguration

class MySecurityConfiguration(SecurityConfiguration):
    schemes = (
        JWTBearer(
            secret = 'change-me',
            issuer = 'https://auth.example.com',
            audience = 'autumn-api'
        ),
    )
```

Сейчас встроенный `JWTBearer` ожидает `HS256`, проверяет подпись, `exp`, `nbf`, `iss`, `aud` и берет роли/permissions из claims `roles` и `permissions`.

## authenticated

`@authenticated` требует любой валидный `Principal`.

```python
from autumn.security import authenticated

@REST(prefix = '/private')
@authenticated
class PrivateController:
    @get('/ping')
    async def ping(self):
        return { 'ok': True }
```

Если ключ или токен не передан, Autumn вернет `401` и добавит `WWW-Authenticate`.

## roles

`@roles` проверяет роль пользователя. Если указать несколько ролей, достаточно одной из них.

```python
from autumn.security import roles

@get('/admin')
@roles('admin')
async def admin(self):
    return { 'ok': True }
```

Роли можно ставить на контроллер и на отдельный метод. Метод наследует требования контроллера.

## permissions

`@permissions` проверяет permissions. Если указать несколько permissions, пользователь должен иметь все.

```python
from autumn.security import permissions

@post('/users')
@permissions('users:create')
async def create_user(self):
    return { 'ok': True }
```

Если пользователь аутентифицирован, но прав не хватает, Autumn вернет `403`.

## requires и policy

`@requires` подключает именованную policy. Это удобно, когда доступ зависит не только от роли, но и от параметров запроса, сервиса или базы данных.

```python
from autumn.security import Principal, policy, requires

@policy('same_user_or_admin')
async def same_user_or_admin(principal: Principal, user_id: str) -> bool:
    return principal.id == user_id or 'admin' in principal.roles

@get('/users/{user_id:str}')
@requires('same_user_or_admin')
async def get_user(self, user_id: str):
    return { 'id': user_id }
```

Policy вызывается через DI-контейнер, поэтому может принимать `Principal`, `Request`, path/query-параметры и сервисы.

## public

`@public` снимает требования с конкретного метода. Это удобно, если весь контроллер закрыт, но один маршрут должен быть открыт.

```python
@REST(prefix = '/account')
@authenticated
class AccountController:
    @get('/login-hint')
    @public
    async def login_hint(self):
        return { 'header': 'X-API-Key' }
```

## fallback_authenticated

Если нужно закрыть все маршруты по умолчанию, включи `fallback_authenticated`.

```python
class MySecurityConfiguration(SecurityConfiguration):
    schemes = (
        APIKey(load_principal),
    )
    fallback_authenticated = True
```

После этого все маршруты требуют аутентификацию, кроме методов или контроллеров с `@public`.

## Несколько схем

Можно подключить несколько схем. Autumn проверяет их по порядку.

```python
class MySecurityConfiguration(SecurityConfiguration):
    schemes = (
        APIKey(load_internal_client, header = 'X-Internal-Key'),
        JWTBearer(secret = 'change-me')
    )
```

Первый loader или scheme, который вернет authenticated `Principal`, выиграет.
