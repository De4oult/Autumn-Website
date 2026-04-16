---
title: Декоратор service
description: Сервисы — это обычные классы со смыслом слоя приложения, а декоратор делает эту роль явной для контейнера.
---

`@service` сообщает Autumn, что класс относится к внедряемому application layer. При этом сам класс всё равно должен читаться как обычный Python.

## Пример

```python
@service
class UsersService:
    def __init__(self, repository: UsersRepository):
        self.repository = repository
```

## Рекомендации по сервисам

- Оставляйте конструктор явным.
- Внедряйте collaborators, а не импортируйте их глобально.
- Пусть сервисы выражают действия и правила, а не HTTP-детали.
