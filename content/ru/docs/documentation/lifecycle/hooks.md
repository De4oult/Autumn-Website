---
title: Hook
description: Запускайте и завершайте приложение в правильный момент его жизненного цикла.
---

Hook'и жизненного цикла позволяют выполнить код при запуске и остановке приложения. В Autumn для этого используются декораторы `@startup` и `@shutdown`.

```python
from autumn import startup, shutdown

@startup
async def connect_to_database():
    print('Connecting Database')

@shutdown
async def disconnect_database():
    print('Disconnecting Database')
```

`@startup` вызывается во время ASGI-события `lifespan.startup`, а `@shutdown` - во время `lifespan.shutdown`.

## Startup hook

Startup hook подходит для инициализации ресурсов, которые нужны приложению перед обработкой запросов.

```python
from autumn import startup

@startup
async def warmup_cache():
    print('Cache warmup')
```

Типичные задачи:
- проверить подключение к базе данных;
- прогреть кеш;
- открыть соединение с внешним сервисом;
- подготовить фоновые ресурсы.

Перед запуском startup hook'ов Autumn синхронизирует провайдеры зависимостей, конфигурации, сервисы и контроллеры.

## Shutdown hook

Shutdown hook используется для аккуратного завершения работы.

```python
from autumn import shutdown

@shutdown
async def close_resources():
    print('Closing resources')
```

Типичные задачи:
- закрыть соединения;
- остановить фоновые задачи;
- сбросить буферы;
- записать финальные логи.

## Несколько hook'ов

Можно объявить несколько `@startup` и `@shutdown` hook'ов.

```python
@startup
async def connect_database():
    ...

@startup
async def connect_cache():
    ...
```

Autumn запускает зарегистрированные startup hook'и через `asyncio.gather`. Shutdown hook'и выполняются таким же способом.

Это значит, что hook'и должны быть независимыми друг от друга. Если один hook обязан выполниться строго после другого, лучше объединить эти шаги в одной функции.

```python
@startup
async def initialize_in_order():
    await connect_database()
    await run_migrations()
    await warmup_cache()
```

## Ошибки в hook'ах

Если startup hook завершится ошибкой, приложение отправит `lifespan.startup.failed` и запуск будет прерван.

Если shutdown hook завершится ошибкой, приложение отправит `lifespan.shutdown.failed`.

```python
@startup
async def connect_database():
    raise RuntimeError('Database is unavailable')
```

Такой hook не даст приложению стартовать нормально.

## Где объявлять hook'и

Hook'и можно объявлять рядом с приложением или в модулях, которые Autumn обнаруживает при старте.

```python
from autumn import Autumn, startup

app = Autumn()

@startup
async def on_startup():
    print('Application started')
```

Для небольших приложений удобно держать hook'и в основном файле. Для больших - выносить в отдельный модуль жизненного цикла.
