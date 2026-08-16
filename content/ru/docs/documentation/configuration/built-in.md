---
title: Встроенная конфигурация
description: Настройте базовые возможности Autumn без лишнего шума.
---

Autumn содержит несколько встроенных конфигураций. Они наследуются от `Configuration`, регистрируются автоматически и могут быть переопределены пользовательскими классами.

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

`ApplicationConfiguration` хранит базовые настройки приложения.

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

`max_request_body_bytes` задаёт максимальный размер тела HTTP-запроса. `0` запрещает непустые тела, а `None` отключает лимит.

`environment` задаёт текущее окружение приложения и является единственным источником правды для `@only`, доступности Web UI и production-safe поведения ошибок. По умолчанию используется `Environment.LOCAL`.

Окружение больше не передаётся в `Autumn(...)`. Настраивай его через наследника `ApplicationConfiguration`.

Чтобы переопределить ее, создай класс-наследник.

```python
from autumn import Environment
from autumn.configuration import ApplicationConfiguration, source, Maple

@source.env(prefix = 'APP_')
class MyApplicationConfiguration(ApplicationConfiguration):
    name: Maple['name', str] = 'My API'
    port: Maple['port', int] = 3000
    environment: Maple['environment', Environment] = Environment.LOCAL
```

Если пользовательская конфигурация наследуется от встроенной, Autumn будет использовать ее как эффективную конфигурацию вместо базовой.

## CORSConfiguration

`CORSConfiguration` управляет CORS-поведением приложения.

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

Пример пользовательской CORS-конфигурации:

```python
from autumn.configuration import CORSConfiguration

class MyCORSConfiguration(CORSConfiguration):
    allowed_origins = ['*']
    allowed_methods = ['POST']
    allowed_headers = ['authorization']
```

Такая конфигурация разрешит CORS-запросы с заголовком `authorization` для `POST`.

## LocalizationConfiguration

`LocalizationConfiguration` управляет request-scoped локализацией.

```python
from autumn.resources import Resources

class LocalizationConfiguration(Configuration):
    supported_locales = ('en',)
    default_locale = 'en'
    source_header = 'Accept-Language'
    locales = Resources('resources/locales')
    plural_rules = {}
```

`supported_locales` задаёт список локалей, которые Autumn может выбрать.

`default_locale` используется, если запрос не передал поддерживаемую локаль.

`source_header` указывает, из какого заголовка запроса выбирать локаль.

`locales` указывает на `Resources`-root с файлами вроде `en.json`, `ru.yaml` или `ka.yml`.

`plural_rules` связывает имена локалей или правил с функциями, которые использует `I18n.plural(...)`.

## WebsocketConfiguration

`WebsocketConfiguration` хранит настройки WebSocket.

```python
class WebsocketConfiguration(Configuration):
    enabled: bool = True

    ping_interval: int = 20
    ping_timeout:  int = 20

    max_message_size: int = 1048576
```

Переопределение работает так же, как у остальных встроенных конфигураций.

```python
from autumn.configuration import WebsocketConfiguration

class MyWebsocketConfiguration(WebsocketConfiguration):
    ping_interval = 10
    ping_timeout  = 10

    max_message_size = 2 * 1024 * 1024
```

## WebUIConfiguration

`WebUIConfiguration` управляет встроенным Web UI: OpenAPI-документацией, графом зависимостей, темой и окружениями, где UI доступен.

```python
class WebUIConfiguration(Configuration):
    enabled: bool = True
    leaves_animation_enabled: bool = True
    default_theme: Theme = Theme.DARK
    allowed_on: Tuple[Environment, ...] = (Environment.LOCAL, Environment.DEVELOPMENT)
```

По умолчанию Web UI доступен в `local` и `development`. В production он скрыт, пока ты явно не разрешишь его через свой наследник `WebUIConfiguration`.

## Как Autumn выбирает конфигурацию

Autumn собирает:
- встроенные конфигурации;
- пользовательские классы, унаследованные от `Configuration`;
- классы-наследники встроенных конфигураций.

Если пользовательский класс наследуется от встроенного, базовая встроенная конфигурация скрывается.

```python
class MyCORSConfiguration(CORSConfiguration):
    allowed_origins = ['*']
```

В этом случае в DI будет зарегистрирован объект `MyCORSConfiguration`, а также он будет доступен по типу `CORSConfiguration`.

```python
@service
class CORSDebugService:
    def __init__(self, cors: CORSConfiguration):
        self.cors = cors
```

## Использование встроенной конфигурации в зависимостях

Встроенную конфигурацию можно принять в leaf, service или controller.

```python
from autumn import leaf
from autumn.configuration import ApplicationConfiguration

@leaf
async def base_url(configuration: ApplicationConfiguration) -> str:
    return configuration.url or f'http://{configuration.host}:{configuration.port}'
```

Конфигурации регистрируются в scope `APP`, то есть живут как singleton на все приложение.
