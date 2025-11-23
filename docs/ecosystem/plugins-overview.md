# Плагины Payload

Плагины Payload полностью используют модульность Payload Config, позволяя разработчикам легко внедрять пользовательскую, иногда сложную функциональность в Payload приложения из очень небольшой точки входа. Это особенно полезно для обмена вашей работой между несколькими проектами или с большим сообществом Payload.

Существует множество **Официальных плагинов**, которые решают некоторые из наиболее распространенных случаев использования, таких как [Form Builder Plugin](https://payloadcms.com/docs/plugins/form-builder) или [SEO Plugin](https://payloadcms.com/docs/plugins/seo). Также доступны [Плагины сообщества](https://payloadcms.com/docs/plugins/overview#community-plugins), поддерживаемые полностью участниками-контрибьюторами. Чтобы расширить функциональность Payload каким-либо другим способом, вы можете легко [создать собственный плагин](https://payloadcms.com/docs/plugins/build-your-own).

Для настройки плагинов используйте свойство `plugins` в вашей Payload Config:

```typescript
import { buildConfig } from 'payload'

const config = buildConfig({
  // ...
  plugins: [
    // Добавьте плагины здесь
  ],
})
```

Написание плагинов не сложнее, чем написание обычного JavaScript. Если вы знаете основную концепцию [функций обратного вызова](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) или то, как работает [синтаксис расширения](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax), и знакомы с концепциями Payload, то создание плагина будет легким.

Поскольку мы полагаемся на простую структуру на основе конфигурации, плагины Payload просто принимают существующую конфигурацию и возвращают **модифицированную** конфигурацию с новыми полями, хуками, коллекциями, административными представлениями или чем-либо еще, что вы можете придумать.

**Примеры случаев использования:**

- Автоматически синхронизировать данные из определенной коллекции с HubSpot или подобной CRM при добавлении или изменении данных
- Добавить функциональность защиты паролем к определенным документам
- Добавить полноценный бэкенд электронной коммерции в любое Payload приложение
- Добавить пользовательские отчеты в Admin Panel Payload
- Шифровать данные определенных коллекций
- Добавить полноценную реализацию конструктора форм
- Интегрировать все коллекции с включенной загрузкой файлов со сторонним хостингом файлов, таким как S3 или Cloudinary
- Добавить пользовательские конечные точки или GraphQL запросы/мутации с любым типом пользовательской функциональности, которую вы можете придумать

## Официальные плагины

Payload поддерживает набор Официальных плагинов, которые решают некоторые распространенные случаи использования. Эти плагины поддерживаются командой Payload и ее контрибьюторами и гарантированно являются стабильными и актуальными.

### Доступные официальные плагины:

- **[Form Builder](https://payloadcms.com/docs/plugins/form-builder)** - Конструктор форм
- **[Nested Docs](https://payloadcms.com/docs/plugins/nested-docs)** - Вложенные документы
- **[Redirects](https://payloadcms.com/docs/plugins/redirects)** - Редиректы
- **[Search](https://payloadcms.com/docs/plugins/search)** - Поиск
- **[Sentry](https://payloadcms.com/docs/plugins/sentry)** - Интеграция с Sentry
- **[SEO](https://payloadcms.com/docs/plugins/seo)** - SEO оптимизация
- **[Stripe](https://payloadcms.com/docs/plugins/stripe)** - Интеграция со Stripe
- **[Import/Export](https://payloadcms.com/docs/plugins/import-export)** - Импорт/Экспорт
- **[Ecommerce](https://payloadcms.com/docs/ecommerce/overview)** - Электронная коммерция

Вы также можете [создать собственный плагин](https://payloadcms.com/docs/plugins/build-your-own), чтобы легко расширить функциональность Payload каким-либо другим способом. Как только ваш плагин будет готов, рассмотрите возможность [поделиться им с сообществом](https://payloadcms.com/docs/plugins/overview#community-plugins).

Плагины меняются каждый день, поэтому обязательно возвращайтесь часто, чтобы увидеть, какие новые плагины могли быть добавлены. Если у вас есть конкретный плагин, который вы хотели бы видеть, не стесняйтесь начать новое [Обсуждение](https://github.com/payloadcms/payload/discussions).

Для полного списка официальных плагинов посетите [Директорию пакетов](https://github.com/payloadcms/payload/tree/main/packages) в [Payload Monorepo](https://github.com/payloadcms/payload).

## Плагины сообщества

Плагины сообщества - это те, которые поддерживаются полностью внешними контрибьюторами. Это отличный способ поделиться своей работой по всей экосистеме для использования другими. Вы можете открыть плагины сообщества, просматривая тему `payload-plugin` на [GitHub](https://github.com/topics/payload-plugin).

Некоторые плагины стали настолько широко используемыми, что они приняты как [Официальный плагин](https://payloadcms.com/docs/plugins/overview#official-plugins), такой как [Lexical Plugin](https://github.com/AlessioGr/payload-plugin-lexical). Если у вас есть плагин, который, по вашему мнению, должен стать официальным плагином, не стесняйтесь начать новое [Обсуждение](https://github.com/payloadcms/payload/discussions).

Для мейнтейнеров, создающих плагины для использования другими, пожалуйста, добавьте тему `payload-plugin` на [GitHub](https://github.com/topics/payload-plugin), чтобы помочь другим найти его.

## Пример

Базовая [Payload Config](https://payloadcms.com/docs/configuration/overview) позволяет использовать свойство `plugins`, которое принимает массив [Plugin Configs](https://payloadcms.com/docs/plugins/build-your-own):

```typescript
import { buildConfig } from 'payload'
import { addLastModified } from './addLastModified.ts'

const config = buildConfig({
  // ...
  plugins: [
    addLastModified
  ],
})
```

Плагины Payload выполняются **после** проверки входящей конфигурации, но перед ее санитизацией и слиянием опций по умолчанию. После выполнения всех плагинов полная конфигурация со всеми плагинами будет санитизирована.

Вот пример того, как может выглядеть плагин `addLastModified` из приведенного выше. Он добавляет поле `lastModifiedBy` во все коллекции Payload. Для получения полной информации см. [как создать собственный плагин](https://payloadcms.com/docs/plugins/build-your-own).

```typescript
import { Config, Plugin } from 'payload'

export const addLastModified: Plugin = (incomingConfig: Config): Config => {
  // Находим все коллекции с поддержкой аутентификации
  // чтобы создать поле связи lastModifiedBy
  // со всеми аутентификационными коллекциями
  const authEnabledCollections = incomingConfig.collections.filter(
    (collection) => Boolean(collection.auth),
  )

  // Распространяем существующую конфигурацию
  const config: Config = {
    ...incomingConfig,
    collections: incomingConfig.collections.map((collection) => {
      // Распространяем каждый элемент, который мы изменяем,
      // и добавляем наше новое поле - полностью с
      // хуками и правильной конфигурацией admin UI
      return {
        ...collection,
        fields: [
          ...collection.fields,
          {
            name: 'lastModifiedBy',
            type: 'relationship',
            relationTo: authEnabledCollections.map(({ slug }) => slug),
            hooks: {
              beforeChange: [
                ({ req }) => ({
                  value: req?.user?.id,
                  relationTo: req?.user?.collection,
                }),
              ],
            },
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
          },
        ],
      }
    }),
  }

  return config
}
```

**Напоминание:** См. [как создать собственный плагин](https://payloadcms.com/docs/plugins/build-your-own) для более подробного объяснения того, как создать собственный плагин Payload.

## Следующие шаги

### Создание собственного плагина

Подробное руководство по созданию собственных плагинов Payload.

#### Связанные руководства

- [Как установить и настроить плагин Payload SEO](https://payloadcms.com/posts/guides/how-to-install-and-configure-the-payload-seo-plugin-nextjs-app)