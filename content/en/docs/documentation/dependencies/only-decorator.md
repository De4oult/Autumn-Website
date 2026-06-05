---

title: @only
description: Restrict the registration of controllers, services, and dependencies to specific environments.
-----------------------------------------------------------------------------------------------------------

The `@only(...)` decorator allows you to specify in which environments a component should be available.

It can be applied to controllers, services, leaf functions, middleware, hooks, and other registrable components.

```python
from autumn import only, Environment, service

@only(Environment.LOCAL, Environment.DEVELOPMENT)
@service
class MockPaymentService:
    ...
```

In this example, `MockPaymentService` will only be registered in the `LOCAL` and `DEVELOPMENT` environments.

If the application is started in any other environment, the component will be ignored.

## Supported values

The `@only(...)` decorator accepts both `Environment` enum values and strings.

::documentation-code
@tab Enum [python]
```python
@only(Environment.DEVELOPMENT)
@service
class DebugService:
    ...
```

@tab string [python]
```python
@only('development')
@service
class DebugService:
    ...
```
::

Using `Environment` values is recommended because it is safer and helps avoid mistakes caused by typos.

## Restricting controllers

If a controller is not allowed in the current environment, Autumn will not register it.

```python
from autumn import REST, only, Environment

@only(Environment.DEVELOPMENT)
@REST(prefix = '/debug')
class DebugController:
    ...
```

When running in `PRODUCTION`:
* the controller will not be registered;
* its routes will not be added to the router;
* its endpoints will not appear in the OpenAPI documentation;
* its dependencies will not be resolved.

This is useful for debug routes, testing APIs, and internal development tools.

## Restricting services and leaf functions

The decorator can also be used for dependencies.

```python
@only(Environment.LOCAL)
@service
class MockMailService:
    ...
```

```python
@only(Environment.DEVELOPMENT)
@leaf
async def mock_payment_gateway() -> PaymentGateway:
    ...
```

If the current environment is not included in the allowed list, the provider will not be registered in the dependency injection container.

## Dependency validation

Autumn validates the dependency graph during application startup.

If an active component depends on a provider that is disabled for the current environment, the application startup will fail with an error.

```python
@only(Environment.DEVELOPMENT)
@service
class MockGateway:
    ...

@service
class PaymentService:
    def __init__(self, gateway: MockGateway):
        self.gateway = gateway
```

If the application is started in `PRODUCTION`, Autumn will detect that `PaymentService` requires a dependency that is unavailable in the current environment and will stop the startup process.

This behavior helps catch configuration errors before the application begins handling requests.

## What happens when the environment does not match

The following behavior applies to components decorated with `@only(...)`:
| Component Type | Behavior                               |
| -------------- | -------------------------------------- |
| Controller     | Excluded from routing and OpenAPI      |
| Service        | Not registered in the DI container     |
| Leaf           | Not registered in the DI container     |
| Middleware     | Not attached to the application        |
| Hook           | Not registered                         |
| Configuration  | Excluded from container initialization |

If a disabled component is not referenced anywhere, the application will continue to run normally.

If an active dependency chain relies on it, startup will fail with a dependency validation error.

## When to use @only

The decorator is especially useful for:
* mock and test service implementations;
* debug controllers;
* local development tools;
* internal administrative endpoints;
* integrations available only in specific environments;
* middleware and hooks that should not run in production.

Typically, `@only(...)` is used to separate production and development implementations without requiring manual code changes.
