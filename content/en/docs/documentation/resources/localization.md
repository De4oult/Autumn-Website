---
title: Localization
description: Inject request-scoped I18n and choose translations from request headers.
---

Autumn provides request-scoped localization through `I18n` and `Locale`.

Localization files are loaded through `Resources`, and the active locale is selected from a request header such as `Accept-Language`.

## Configuration

```python
from autumn.configuration import LocalizationConfiguration
from autumn.resources import Resources

class AppLocalization(LocalizationConfiguration):
    supported_locales = ('en', 'ru')
    default_locale = 'en'
    source_header = 'Accept-Language'
    locales = Resources('resources/locales')
```

For each supported locale, Autumn looks for:

- `{locale}.json`
- `{locale}.yaml`
- `{locale}.yml`

For example:

```text
resources/
└── locales/
    ├── en.json
    └── ru.yaml
```

## Locale Files

```json
{
    "hello": {
        "message": "Hello, {name}"
    }
}
```

Nested objects can be accessed with dot-separated keys.

## Using I18n in Controllers

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

If the request contains:

```http
Accept-Language: ru-RU, en;q=0.5
```

Autumn will choose `ru` when it is listed in `supported_locales`.

## Fallback Behavior

If Autumn cannot find a locale file, it prints a warning and translations fall back to the key.

```python
i18n.t('profile.title')
```

If `profile.title` is missing, the returned value is:

```text
profile.title
```

This keeps the application running while making missing localization files visible during development.

## Pluralization

Use `i18n.plural(...)` when a message has several variants depending on a number.

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

By default, Autumn uses `one` for `1` and `many` for every other value.

For languages with different plural rules, register custom methods in `LocalizationConfiguration`.

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

Then the locale file can define the variants returned by the rule.

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
