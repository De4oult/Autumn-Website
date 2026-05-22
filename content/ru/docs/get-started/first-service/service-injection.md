---
title: Внедрение сервиса
description: Внедряйте сервис в контроллер вместо ручной сборки объектов.
---

Autumn использует явное объявление зависимостей через конструктор.  
Если контроллеру требуется сервис, достаточно указать его в `__init__` — контейнер автоматически передаст нужный экземпляр.

## Контроллер + сервис


::documentation-code
@tab controller/hello.py [python]

```python
from autumn.controller import REST, get
from autumn.response import JSONResponse

from app.services.greeting import GreetingService

@REST(prefix = '/hello')
class HelloController:
    def __init__(self, service: GreetingService) -> None:
        self.service = service
    
    @get('/{name:str}')
    async def hello_by_name(self, name: str) -> JSONResponse:
        return JSONResponse({
            'message' : self.service.build_message(name)
        })
```

@tab services/greeting.py [python]

```python
from autumn import service

@service
class GreetingService:
    def build_message(self, name: str) -> str:
        return f'Hello from service, {name}'
```
::

## Что это даёт
- Зависимости явно описаны в конструкторе
- Контроллер не отвечает за создание сервисов
- DI-контейнер управляет жизненным циклом объектов

Это и есть подход Autumn: зависимости остаются явными, а связывание компонентов выполняется автоматически.