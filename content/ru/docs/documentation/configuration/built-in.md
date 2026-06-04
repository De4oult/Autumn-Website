---
title: Встроенная конфигурация
description: Настройте базовые возможности Autumn без лишнего шума.
---

Autumn содержит несколько встроенных конфигураций. Они наследуются от `Configuration`, регистрируются автоматически и могут быть переопределены пользовательскими классами.

```python
from autumn.configuration import (
    ApplicationConfiguration,
    CORSConfiguration,
    WebsocketConfiguration
)
```

## ApplicationConfiguration

`ApplicationConfiguration` хранит базовые настройки приложения.

```python
class ApplicationConfiguration(Configuration):
    name:    str = 'Autumn API'
    version: str = 'v0.1.0'

    description: Optional[str] = None

    host: str = '127.0.0.1'
    port: int = 8000

    url: Optional[str] = None

    workers: int = 1
    log_level: str = 'info'
```

Чтобы переопределить ее, создай класс-наследник.

```python
from autumn.configuration import ApplicationConfiguration, source, Maple

@source.env(prefix = 'APP_')
class MyApplicationConfiguration(ApplicationConfiguration):
    name: Maple['name', str] = 'My API'
    port: Maple['port', int] = 3000
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
