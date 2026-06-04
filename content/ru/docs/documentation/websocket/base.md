---
title: Работа с WebSocket
description: Откройте постоянное соединение и держите диалог живым, как теплый осенний вечер.
---

Autumn поддерживает WebSocket-маршруты через декоратор `@websocket`.

```python
from autumn.websocket import websocket, WebSocketDisconnect

@websocket('/ws/echo')
async def echo(websocket):
    await websocket.accept()

    try:
        while True:
            message = await websocket.receive_text()

            await websocket.send_text(f'echo: {message}')

    except WebSocketDisconnect:
        return
```

WebSocket-обработчик может быть отдельной функцией или методом контроллера.

## WebSocket в контроллере

В контроллере WebSocket-маршрут объявляется так же, как HTTP-маршрут, но через `@websocket`.

```python
from autumn.controller import REST
from autumn.websocket import websocket, WebSocketDisconnect

@REST()
class BaseController:
    @websocket('/ws/echo')
    async def echo(self, websocket):
        await websocket.accept()

        try:
            while True:
                await websocket.receive_text()
                await websocket.send_text('echo')

        except WebSocketDisconnect:
            return
```

## Принять соединение

Перед отправкой сообщений нужно принять WebSocket-соединение.

```python
await websocket.accept()
```

Можно указать subprotocol и дополнительные заголовки.

```python
await websocket.accept(
    subprotocol = 'chat',

    headers = [
        (b'x-ws', b'autumn')
    ]
)
```

Если `accept()` вызвать повторно, Autumn ничего не отправит второй раз.

## Получение сообщений

Для текста используй `receive_text()`.

```python
message = await websocket.receive_text()
```

Если клиент отправил bytes-frame, `receive_text()` попробует декодировать его как UTF-8.

```python
message = await websocket.receive_text(encoding='utf-8')
```

Для bytes используй `receive_bytes()`.

```python
payload = await websocket.receive_bytes()
```

Если клиент отправил text-frame, `receive_bytes()` закодирует его в UTF-8.

## Отправка сообщений

Для текста:

```python
await websocket.send_text('hello')
```

Для bytes:

```python
await websocket.send_bytes(b'hello')
```

## Отключение клиента

Когда клиент закрывает соединение, Autumn выбрасывает `WebSocketDisconnect`.

```python
try:
    while True:
        text = await websocket.receive_text()

        await websocket.send_text(text)

except WebSocketDisconnect:
    return
```

У исключения есть поле `code`.

```python
except WebSocketDisconnect as disconnect:
    print(disconnect.code)
```

## Закрытие соединения

Сервер может закрыть соединение сам.

```python
await websocket.close(code = 1000, reason = 'Done')
```

Если `close()` вызвать повторно, Autumn не отправит закрытие второй раз.

## Path-параметры и зависимости

WebSocket-маршруты поддерживают path-параметры и DI.

```python
@REST(prefix = '/users')
class UserController:
    @websocket('/{id:int}/ws')
    async def user_ws(self, websocket, id: int, database: DBClient):
        user_name: str = (
            database
                .select('name')
                .table('users')
                .eq('id', id)
                .name
        )

        await websocket.accept()
        await websocket.send_text(f'{id} -> {user_name}')
```

Autumn передаст:
- `websocket` - текущий WebSocket-объект;
- `id` - path-параметр;
- `database` - зависимость из контейнера.

## Доступные свойства

У WebSocket-объекта есть свойства:
```python
websocket.path
websocket.query_string
websocket.accepted
websocket.closed
```

`query_string` возвращается как `bytes`, как в ASGI scope.

## Если маршрут не найден

Если WebSocket-подключение пришло на неизвестный путь, Autumn закроет соединение с кодом `1000`.
