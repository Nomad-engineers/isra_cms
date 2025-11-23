# Rich Text (Форматированный текст)

Rich Text поля в Payload CMS предоставляют мощный WYSIWYG редактор для создания и редактирования структурированного контента. Payload поддерживает различные редакторы с дополнительными возможностями кастомизации.

## Базовая конфигурация

### Slate Editor (стандартный)

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { slateEditor } from '@payloadcms/richtext-slate'

export default buildConfig({
  editor: slateEditor,
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },
  ],
})
```

### Lexical Editor (альтернативный)

```typescript
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default buildConfig({
  editor: lexicalEditor,
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          name: 'content',
          type: 'richText',
          editor: lexicalEditor(),
        },
      ],
    },
  ],
})
```

## Настройка Rich Text полей

### Базовые опции

```typescript
{
  name: 'content',
  type: 'richText',
  required: true,
  admin: {
    elements: ['h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'link'], // Доступные элементы
    leaves: ['bold', 'italic', 'underline', 'strikethrough'], // Доступные стили
    upload: {
      collections: {
        media: {
          limit: 5, // Лимит загружаемых файлов
        },
      },
    },
  },
}
```

### Полная конфигурация

```typescript
{
  name: 'content',
  type: 'richText',
  label: 'Content',
  required: true,
  localized: true, // Мультиязычность
  admin: {
    elements: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'blockquote',
      'link',
      'upload',
      'relationship',
    ],
    leaves: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'code',
    ],
    upload: {
      collections: {
        media: {
          // Дополнительная конфигурация загрузки
        },
      },
      clientUploadSizeLimit: '5MB',
      serverUploadSizeLimit: '10MB',
    },
    links: {
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Internal Link', value: 'internal' },
            { label: 'External Link', value: 'external' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData.type === 'external',
          },
          required: true,
        },
        {
          name: 'doc',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (data, siblingData) => siblingData.type === 'internal',
          },
          required: true,
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  },
}
```

## Кастомные элементы

### Создание кастомного блока

```typescript
// components/CustomBlock.tsx
import React from 'react'
import { RichText } from '@payloadcms/richtext-slate'

const CustomBlock = ({ data }) => {
  return (
    <div className="custom-block">
      <div className="custom-block__image">
        {data.upload && (
          <img
            src={data.upload.url}
            alt={data.upload.alt}
          />
        )}
      </div>
      <div className="custom-block__content">
        <RichText content={data.content} />
        {data.caption && (
          <p className="custom-block__caption">{data.caption}</p>
        )}
      </div>
    </div>
  )
}

export default CustomBlock
```

### Регистрация кастомного элемента

```typescript
// payload.config.ts
import { slateEditor } from '@payloadcms/richtext-slate'
import CustomBlock from './components/CustomBlock'

export default buildConfig({
  editor: slateEditor({
    elements: [
      // ... стандартные элементы
      {
        name: 'custom-block',
        type: 'block',
        fields: [
          {
            name: 'upload',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
          {
            name: 'content',
            type: 'richText',
            required: true,
          },
          {
            name: 'caption',
            type: 'text',
          },
        ],
        BlockComponent: CustomBlock,
      },
    ],
  }),
})
```

## Работа с Rich Text на фронтенде

### Рендеринг Rich Text контента

```typescript
// components/RichTextRenderer.tsx
import React from 'react'
import { RichText } from '@payloadcms/richtext-slate'
import { Heading1, Heading2, Heading3 } from './Headings'
import { CustomBlock } from './CustomBlock'

interface RichTextRendererProps {
  content: any
  className?: string
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className
}) => {
  if (!content) return null

  return (
    <div className={`rich-text ${className || ''}`}>
      <RichText
        content={content}
        components={{
          h1: ({ children }) => <Heading1>{children}</Heading1>,
          h2: ({ children }) => <Heading2>{children}</Heading2>,
          h3: ({ children }) => <Heading3>{children}</Heading3>,
          'custom-block': CustomBlock,
        }}
      />
    </div>
  )
}
```

### Server-Side рендеринг

```typescript
// utils/richText.ts
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical'
import { convertSlateToHTML } from '@payloadcms/richtext-slate'

export function richTextToHTML(content: any, editorType: 'slate' | 'lexical' = 'slate') {
  if (editorType === 'lexical') {
    return convertLexicalToHTML({ content })
  }
  return convertSlateToHTML({ content })
}
```

```typescript
// pages/blog/[slug].tsx
import { GetServerSideProps } from 'next'
import { getPayload } from 'payload'
import { richTextToHTML } from '../../../utils/richText'

export default function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{
        __html: richTextToHTML(post.content)
      }} />
    </article>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const payload = await getPayload()

  const post = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: context.params.slug }
    },
  })

  return {
    props: {
      post: post.docs[0],
    },
  }
}
```

## API работа с Rich Text

### Получение Rich Text контента

```typescript
// API запрос для получения контента
const response = await fetch('/api/posts')
const posts = await response.json()

// Rich Text контент возвращается в виде JSON структуры
{
  "docs": [
    {
      "title": "My Post",
      "content": [
        {
          "children": [
            {
              "text": "Hello world!"
            }
          ],
          "type": "p"
        }
      ]
    }
  ]
}
```

### Модификация Rich Text через API

```typescript
// Создание поста с Rich Text контентом
const createPost = async (title: string, content: any) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content, // Rich Text JSON структура
    }),
  })

  return response.json()
}
```

## Стилизация Rich Text

### Базовые стили

```css
/* styles/rich-text.css */
.rich-text {
  line-height: 1.6;
  color: #333;
}

.rich-text h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

.rich-text h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.rich-text h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.rich-text p {
  margin-bottom: 1rem;
}

.rich-text ul,
.rich-text ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.rich-text li {
  margin-bottom: 0.5rem;
}

.rich-text blockquote {
  border-left: 4px solid #ccc;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}

.rich-text a {
  color: #0066cc;
  text-decoration: underline;
}

.rich-text a:hover {
  color: #004499;
}

.rich-text strong {
  font-weight: bold;
}

.rich-text em {
  font-style: italic;
}

.rich-text code {
  background-color: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.9rem;
}
```

### Адаптивные стили

```css
.rich-text {
  max-width: 100%;
  overflow-wrap: break-word;
}

.rich-text img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .rich-text h1 {
    font-size: 2rem;
  }

  .rich-text h2 {
    font-size: 1.5rem;
  }

  .rich-text h3 {
    font-size: 1.25rem;
  }
}
```

## Валидация Rich Text

### Кастомная валидация

```typescript
{
  name: 'content',
  type: 'richText',
  validate: (value) => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return 'Content is required'
    }

    // Проверка на минимальное количество символов
    const textContent = JSON.stringify(value).replace(/[^a-zA-Z0-9]/g, '')
    if (textContent.length < 10) {
      return 'Content must be at least 10 characters long'
    }

    return true
  },
}
```

### Валидация структуры контента

```typescript
const validateRichTextStructure = (content: any[]) => {
  if (!Array.isArray(content)) return false

  return content.every(node => {
    if (!node.type) return false

    // Проверка обязательных полей
    if (!node.children || !Array.isArray(node.children)) {
      return false
    }

    return node.children.every(child =>
      typeof child === 'object' &&
      typeof child.text === 'string'
    )
  })
}
```

## SEO и доступность

### Структурированные данные

```typescript
// utils/structuredData.ts
export function extractTextFromRichText(content: any[]): string {
  if (!Array.isArray(content)) return ''

  return content
    .map(node => {
      if (node.children) {
        return node.children
          .map((child: any) => child.text || '')
          .join('')
      }
      return ''
    })
    .join(' ')
    .trim()
}

export function generateExcerpt(content: any[], maxLength: number = 160): string {
  const text = extractTextFromRichText(content)
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text
}
```

### Accessibility

```typescript
// Дополнительные атрибуты для доступности
{
  name: 'content',
  type: 'richText',
  admin: {
    elements: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'blockquote', 'link', 'upload'
    ],
    // Включение ARIA атрибутов
    hooks: {
      beforeChange: [
        ({ value }) => {
          // Добавление accessibility атрибутов
          if (Array.isArray(value)) {
            return enhanceRichTextForAccessibility(value)
          }
          return value
        }
      ]
    }
  }
}
```

## Best Practices

### 1. Структура контента
- Используйте правильные заголовки (h1-h6)
- Структурируйте контент логически
- Избегайте пустых параграфов

### 2. Производительность
- Ограничивайте количество загружаемых изображений
- Используйте сжатие изображений
- Кэшируйте отрендеренный контент

### 3. Безопасность
- Санитизируйте HTML при рендеринге
- Ограничивайте доступные элементы и стили
- Валидируйте загружаемые файлы

### 4. UX/UI
- Предоставляйте предпросмотр контента
- Используйте auto-save для черновиков
- Показывайте лимиты символов где это необходимо

## Расширение функциональности

### Плагины для Rich Text

```typescript
// Пример плагина для цитат с источником
const quoteWithSourcePlugin = {
  name: 'quote-with-source',
  type: 'block',
  fields: [
    {
      name: 'text',
      type: 'richText',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceLink',
      type: 'text',
    },
  ],
}
```

### Интеграция с внешними сервисами

```typescript
// Автоматическое сохранение в черновики
import { debounce } from 'lodash'

const saveDraft = debounce(async (content: any, id: string) => {
  await fetch(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _status: 'draft',
      content,
    }),
  })
}, 1000)
```

## Troubleshooting

### Частые проблемы

1. **Пустой контент**
   - Проверьте структуру JSON
   - Убедитесь, что массивы не пустые

2. **Некорректное отображение**
   - Проверьте CSS стили
   - Убедитесь, что все компоненты зарегистрированы

3. **Проблемы с загрузкой файлов**
   - Проверьте конфигурацию upload
   - Убедитесь, что коллекция media существует

4. **Производительность**
   - Оптимизируйте размер контента
   - Используйте кэширование

5. **SEO проблемы**
   - Проверьте структуру заголовков
   - Убедитесь в наличии alt текстов для изображений