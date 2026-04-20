---
title: Локальная настройка
description: Python, виртуальное окружение и первая установка пакета.
---

Autumn лучше всего чувствует себя в чистом Python-окружении. Идея простая: один проект, одно окружение, никакого скрытого состояния машины.

## Что понадобится
- Python 3.12 или новее
- `pip` в терминале
- Отдельное виртуальное окружение на проект

Выберите тот процесс, который удобнее команде. `venv` проще и ближе к стандартному Python-подходу, а `pipenv` удобен, если хочется держать окружение и зависимости вместе.

::documentation-code
@tab venv [bash]

```bash
python -m venv .venv
source .venv/bin/activate

pip install autumn-framework uvicorn
```

@tab pipenv [bash]

```bash
pip install pipenv
pipenv --python 3.12

pipenv install autumn-framework uvicorn
pipenv shell
```
::

## Рекомендуемая стартовая структура

```text
app/
    controllers/
    services/
app.py
```

Структура специально маленькая. Начните с папок по зонам ответственности, а дальше пусть проект растёт вокруг этой формы.
