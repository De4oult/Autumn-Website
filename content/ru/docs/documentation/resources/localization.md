---
title: Локализация
description: Инжектите request-scoped I18n и выбирайте переводы по заголовкам запроса.
---

Autumn даёт request-scoped локализацию через `I18n` и `Locale`.

Файлы локализации загружаются через `Resources`, а активная локаль выбирается из заголовка запроса, например `Accept-Language`.

## Конфигурация

```python
from autumn.configuration import LocalizationConfiguration
from autumn.resources import Resources

class AppLocalization(LocalizationConfiguration):
    supported_locales = ('en', 'ru')
    default_locale = 'en'
    source_header = 'Accept-Language'
    locales = Resources('resources/locales')
```

Для каждой поддерживаемой локали Autumn ищет:

- `{locale}.json`
- `{locale}.yaml`
- `{locale}.yml`

Например:

```text
resources/
└── locales/
    ├── en.json
    └── ru.yaml
```

## Файлы локализации

```json
{
    "hello": {
        "message": "Привет, {name}"
    }
}
```

К вложенным значениям можно обращаться через ключи с точками.

## Использование I18n в контроллере

```python
from autumn.controller import REST, get
from autumn.i18n import I18n, Locale

@REST(prefix = '/hello')
class HelloController:
    @get('/')
    async def index(self, i18n: I18n, locale: Locale) -> dict:
        return {
            'locale': locale.code,
            'message': i18n.t('hello.message', name = 'Autumn')
        }
```

Если запрос содержит:

```http
Accept-Language: ru-RU, en;q=0.5
```

Autumn выберет `ru`, если эта локаль есть в `supported_locales`.

## Fallback

Если Autumn не нашёл файл локали, он выведет warning в консоль, а перевод вернёт сам ключ.

```python
i18n.t('profile.title')
```

Если `profile.title` отсутствует, результат будет таким:

```text
profile.title
```

Так приложение продолжает работать, но проблема с локализацией остаётся заметной во время разработки.

## Плюрализация

Используй `i18n.plural(...)`, когда у сообщения есть несколько вариантов в зависимости от числа.

```json
{
    "cart": {
        "items": {
            "one": "{count} item",
            "many": "{count} items"
        }
    }
}
```

```python
message = i18n.plural('cart.items', 3)
```

По умолчанию Autumn использует `one` для `1` и `many` для всех остальных значений.

Для языков с другими правилами можно зарегистрировать свои методы в `LocalizationConfiguration`.

```python
def russian_plural(count: int | float) -> str:
    value = abs(int(count))

    if value % 10 == 1 and value % 100 != 11:
        return 'one'

    if 2 <= value % 10 <= 4 and not 12 <= value % 100 <= 14:
        return 'few'

    return 'many'

class AppLocalization(LocalizationConfiguration):
    supported_locales = ('en', 'ru')
    default_locale = 'en'
    locales = Resources('resources/locales')
    plural_rules = {
        'ru': russian_plural
    }
```

После этого файл локали может описывать варианты, которые возвращает правило.

```json
{
    "cart": {
        "items": {
            "one": "{count} товар",
            "few": "{count} товара",
            "many": "{count} товаров"
        }
    }
}
```
