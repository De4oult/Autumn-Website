---
title: Authorization
description: Add authentication, roles, permissions, and access policies directly in Autumn.
---

Autumn Security gives an application one place to identify who is making a request and decide whether that request may reach a route.

Core pieces:

- `Principal` is the current user or service identity;
- `SecurityConfiguration` configures authentication schemes;
- `APIKey` and `JWTBearer` are built-in schemes;
- `@authenticated`, `@roles`, `@permissions`, `@requires`, and `@public` define route access requirements;
- `@policy` registers named rules that can use DI.

## Principal

`Principal` describes the current identity.

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

Handlers can receive it as a regular dependency.

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

On public routes `Principal` is available too, but it is anonymous:

```python
principal.authenticated == False
```

## SecurityConfiguration

Authentication schemes are configured with a `SecurityConfiguration` subclass.

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

`APIKey` reads the configured header and passes its value to the loader. If the loader returns a `Principal`, the request is authenticated. If it returns `None`, Autumn tries the next scheme or returns `401` for a protected route.

## JWTBearer

JWT authentication can use `JWTBearer`.

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

The built-in `JWTBearer` currently expects `HS256`, validates the signature, `exp`, `nbf`, `iss`, and `aud`, and reads roles and permissions from the `roles` and `permissions` claims.

## authenticated

`@authenticated` requires any valid `Principal`.

```python
from autumn.security import authenticated

@REST(prefix = '/private')
@authenticated
class PrivateController:
    @get('/ping')
    async def ping(self):
        return { 'ok': True }
```

If no key or token is provided, Autumn returns `401` and includes `WWW-Authenticate`.

## roles

`@roles` checks the user's role. If multiple roles are listed, one of them is enough.

```python
from autumn.security import roles

@get('/admin')
@roles('admin')
async def admin(self):
    return { 'ok': True }
```

Roles can be placed on a controller or on a method. A method inherits controller-level requirements.

## permissions

`@permissions` checks permissions. If multiple permissions are listed, the user must have all of them.

```python
from autumn.security import permissions

@post('/users')
@permissions('users:create')
async def create_user(self):
    return { 'ok': True }
```

If the user is authenticated but lacks access, Autumn returns `403`.

## requires and policy

`@requires` attaches a named policy. This is useful when access depends on request parameters, services, or database state.

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

Policies are called through the DI container, so they can receive `Principal`, `Request`, path/query parameters, and services.

## public

`@public` removes requirements from a specific method. It is handy when a whole controller is protected, but one route should stay open.

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

To protect all routes by default, enable `fallback_authenticated`.

```python
class MySecurityConfiguration(SecurityConfiguration):
    schemes = (
        APIKey(load_principal),
    )
    fallback_authenticated = True
```

After that, every route requires authentication unless the method or controller is marked with `@public`.

## Multiple Schemes

Several schemes can be configured. Autumn checks them in order.

```python
class MySecurityConfiguration(SecurityConfiguration):
    schemes = (
        APIKey(load_internal_client, header = 'X-Internal-Key'),
        JWTBearer(secret = 'change-me')
    )
```

The first scheme or loader that returns an authenticated `Principal` wins.
