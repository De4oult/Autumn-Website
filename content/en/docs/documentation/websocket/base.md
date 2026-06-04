---
title: Working with WebSocket
description: Open a persistent connection and keep the conversation alive like a warm autumn evening.
---

Autumn supports WebSocket routes through the `@websocket` decorator.

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

A WebSocket handler can be a standalone function or a controller method.

## WebSocket in a Controller

In a controller, a WebSocket route is declared like an HTTP route, but with `@websocket`.

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

## Accepting a Connection

Before sending messages, accept the WebSocket connection.

```python
await websocket.accept()
```

You can pass a subprotocol and extra headers.

```python
await websocket.accept(
    subprotocol = 'chat',

    headers = [
        (b'x-ws', b'autumn')
    ]
)
```

Calling `accept()` again sends nothing the second time.

## Receiving Messages

Use `receive_text()` for text.

```python
message = await websocket.receive_text()
```

If the client sends a bytes frame, `receive_text()` tries to decode it as UTF-8.

```python
message = await websocket.receive_text(encoding='utf-8')
```

Use `receive_bytes()` for bytes.

```python
payload = await websocket.receive_bytes()
```

If the client sends a text frame, `receive_bytes()` encodes it as UTF-8.

## Sending Messages

For text:

```python
await websocket.send_text('hello')
```

For bytes:

```python
await websocket.send_bytes(b'hello')
```

## Client Disconnect

When the client closes the connection, Autumn raises `WebSocketDisconnect`.

```python
try:
    while True:
        text = await websocket.receive_text()

        await websocket.send_text(text)

except WebSocketDisconnect:
    return
```

The exception has a `code` field.

```python
except WebSocketDisconnect as disconnect:
    print(disconnect.code)
```

## Closing the Connection

The server can close the connection itself.

```python
await websocket.close(code = 1000, reason = 'Done')
```

Calling `close()` again sends no second close event.

## Path Parameters and Dependencies

WebSocket routes support path parameters and DI.

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
        )

        await websocket.accept()
        await websocket.send_text(f'{id} -> {user_name}')
```

Autumn passes:

- `websocket` - the current WebSocket object;
- `id` - the path parameter;
- `database` - a dependency from the container.

## Available Properties

The WebSocket object has:

```python
websocket.path
websocket.query_string
websocket.accepted
websocket.closed
```

`query_string` is returned as `bytes`, as in the ASGI scope.

## If the Route Is Not Found

If a WebSocket connection comes to an unknown path, Autumn closes it with code `1000`.
