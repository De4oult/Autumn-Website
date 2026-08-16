---
title: Built-in Configuration
description: Configure Autumn's built-in features without extra noise.
---

Autumn includes several built-in configurations. They inherit from `Configuration`, are registered automatically, and can be overridden by custom classes.

```python
from autumn.configuration import (
    ApplicationConfiguration,
    CORSConfiguration,
    LocalizationConfiguration,
    WebsocketConfiguration
)
from autumn import Environment
```

## ApplicationConfiguration

`ApplicationConfiguration` stores base application settings.

```python
class ApplicationConfiguration(Configuration):
    name:    str = 'Autumn API'
    version: str = 'v0.1.0'

    description: Optional[str] = None
    environment: Environment = Environment.LOCAL

    host: str = '127.0.0.1'
    port: int = 8000

    url: Optional[str] = None

    workers: int = 1
    log_level: str = 'info'

    max_request_body_bytes: Optional[int] = 1024 * 1024
```

`max_request_body_bytes` is the maximum accepted HTTP request body size. `0` rejects non-empty bodies and `None` disables the limit.

`environment` defines the current application environment and is the single source of truth for `@only`, Web UI availability, and production-safe error behavior. The default is `Environment.LOCAL`.

The environment is no longer passed to `Autumn(...)`. Configure it through an `ApplicationConfiguration` subclass.

To override it, create a subclass.

```python
from autumn import Environment
from autumn.configuration import ApplicationConfiguration, source, Maple

@source.env(prefix = 'APP_')
class MyApplicationConfiguration(ApplicationConfiguration):
    name: Maple['name', str] = 'My API'
    port: Maple['port', int] = 3000
    environment: Maple['environment', Environment] = Environment.LOCAL
```

If a custom configuration inherits from a built-in one, Autumn uses it as the effective configuration instead of the base class.

## CORSConfiguration

`CORSConfiguration` controls CORS behavior.

```python
class CORSConfiguration(Configuration):
    enabled: bool = True

    allowed_origins: List[str] = []
    allowed_methods: List[str] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    allowed_headers: List[str] = []

    allow_credentials: bool = False
    expose_headers: List[str] = []
    max_age: int = 600
```

Example custom CORS configuration:

```python
from autumn.configuration import CORSConfiguration

class MyCORSConfiguration(CORSConfiguration):
    allowed_origins = ['*']
    allowed_methods = ['POST']
    allowed_headers = ['authorization']
```

This configuration allows CORS requests with the `authorization` header for `POST`.

## LocalizationConfiguration

`LocalizationConfiguration` controls request-scoped localization.

```python
from autumn.resources import Resources

class LocalizationConfiguration(Configuration):
    supported_locales = ('en',)
    default_locale = 'en'
    source_header = 'Accept-Language'
    locales = Resources('resources/locales')
    plural_rules = {}
```

`supported_locales` lists locales that Autumn may select.

`default_locale` is used when the request does not provide a supported locale.

`source_header` defines which request header is used for locale selection.

`locales` points to a `Resources` root containing files such as `en.json`, `ru.yaml`, or `ka.yml`.

`plural_rules` maps locale names or rule names to functions used by `I18n.plural(...)`.

## WebsocketConfiguration

`WebsocketConfiguration` stores WebSocket settings.

```python
class WebsocketConfiguration(Configuration):
    enabled: bool = True

    ping_interval: int = 20
    ping_timeout:  int = 20

    max_message_size: int = 1048576
```

Override it the same way as other built-in configurations.

```python
from autumn.configuration import WebsocketConfiguration

class MyWebsocketConfiguration(WebsocketConfiguration):
    ping_interval = 10
    ping_timeout  = 10

    max_message_size = 2 * 1024 * 1024
```

## WebUIConfiguration

`WebUIConfiguration` controls the built-in Web UI: OpenAPI documentation, the dependency graph, theme, and environments where the UI is available.

```python
class WebUIConfiguration(Configuration):
    enabled: bool = True
    leaves_animation_enabled: bool = True
    default_theme: Theme = Theme.DARK
    allowed_on: Tuple[Environment, ...] = (Environment.LOCAL, Environment.DEVELOPMENT)
```

By default, the Web UI is available in `local` and `development`. In production it stays hidden unless you explicitly allow it through your own `WebUIConfiguration` subclass.

## How Autumn Chooses Configuration

Autumn collects:

- built-in configurations;
- custom classes inherited from `Configuration`;
- subclasses of built-in configurations.

If a custom class inherits from a built-in one, the base built-in configuration is hidden.

```python
class MyCORSConfiguration(CORSConfiguration):
    allowed_origins = ['*']
```

In this case, DI registers a `MyCORSConfiguration` object, and it is also available by the `CORSConfiguration` type.

```python
@service
class CORSDebugService:
    def __init__(self, cors: CORSConfiguration):
        self.cors = cors
```

## Using Built-in Configuration in Dependencies

Built-in configuration can be accepted in a leaf, service, or controller.

```python
from autumn import leaf
from autumn.configuration import ApplicationConfiguration

@leaf
async def base_url(configuration: ApplicationConfiguration) -> str:
    return configuration.url or f'http://{configuration.host}:{configuration.port}'
```

Configurations are registered in `APP` scope, so they live as singletons for the whole application.
