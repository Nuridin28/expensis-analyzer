# Инструкция по деплою

## ✅ Деплой завершен!

### Backend на Render ✅
**URL**: https://expensis-analyzer.onrender.com

### Frontend на Vercel ✅
**URL**: https://expensis-analyzer.vercel.app/

---

## Проверка работоспособности

### 1. Проверьте переменную окружения в Vercel

Убедитесь, что в Vercel Dashboard → Settings → Environment Variables установлено:
- **Key**: `VITE_API_URL`
- **Value**: `https://expensis-analyzer.onrender.com` (без слеша в конце!)

Если переменная не установлена или указана неправильно:
1. Зайдите в Vercel Dashboard → ваш проект → Settings → Environment Variables
2. Добавьте/измените `VITE_API_URL` = `https://expensis-analyzer.onrender.com`
3. Выберите все окружения (Production, Preview, Development)
4. Сохраните и сделайте новый деплой (Redeploy)

### 2. Проверьте подключение к backend

Откройте консоль браузера (F12) на https://expensis-analyzer.vercel.app/ и проверьте:
- Нет ли ошибок CORS
- Правильно ли формируются запросы к API
- Запросы должны идти на `https://expensis-analyzer.onrender.com/api/...`

### 3. Тест функциональности

1. Попробуйте загрузить пример выписки (кнопка "Загрузить пример")
2. Или загрузите PDF/JSON файл
3. Проверьте, что анализ выполняется успешно

---

## Frontend на Vercel (инструкция для будущих деплоев)

### Шаг 1: Подготовка репозитория

Убедитесь, что все изменения закоммичены и запушены в GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### Шаг 2: Деплой через Vercel Dashboard

1. Зайдите на [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите **"Add New..."** → **"Project"**
3. Выберите ваш репозиторий `flutter_without_a_flutter`
4. Настройки проекта:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (важно!)
   - **Build Command**: `npm run build` (уже указано в vercel.json)
   - **Output Directory**: `dist` (уже указано в vercel.json)
   - **Install Command**: `npm install` (уже указано в vercel.json)

### Шаг 3: Переменные окружения

В разделе **"Environment Variables"** добавьте:

- **Key**: `VITE_API_URL`
- **Value**: `https://expensis-analyzer.onrender.com`
- **Environment**: Production, Preview, Development (отметьте все)

### Шаг 4: Деплой

Нажмите **"Deploy"** и дождитесь завершения сборки.

---

## Альтернатива: Деплой через Vercel CLI

```bash
# Установите Vercel CLI (если еще не установлен)
npm install -g vercel

# Перейдите в папку frontend
cd frontend

# Войдите в Vercel
vercel login

# Деплой (первый раз)
vercel

# Установите переменную окружения
vercel env add VITE_API_URL production
# Введите значение: https://expensis-analyzer.onrender.com (без слеша в конце!)

# Деплой в production
vercel --prod
```

---

## Проверка после деплоя

1. Откройте ваш Vercel URL (например: `https://your-app.vercel.app`)
2. Откройте консоль браузера (F12)
3. Проверьте, что запросы идут на правильный backend URL
4. Протестируйте загрузку выписки

---

## Troubleshooting

### Frontend не может подключиться к backend

1. Проверьте переменную окружения `VITE_API_URL` в Vercel Dashboard
2. Убедитесь, что значение: `https://expensis-analyzer.onrender.com` (без слеша в конце)
3. После изменения переменных окружения нужно сделать новый деплой

### CORS ошибки

Backend уже настроен с `app.use(cors())`, но если возникают проблемы:
- Убедитесь, что backend на Render запущен и доступен
- Проверьте логи в Render Dashboard

### Backend не отвечает

1. Проверьте логи в Render Dashboard
2. Убедитесь, что backend не "засыпает" (на Free плане сервисы засыпают после 15 минут неактивности)
3. Первый запрос после пробуждения может занять несколько секунд

---

## Структура проекта для деплоя

```
flutter_without_a_flutter/
├── backend/              # Деплоится на Render ✅
│   └── server.js
├── frontend/             # Деплоится на Vercel
│   ├── vercel.json       # Конфигурация Vercel ✅
│   ├── src/
│   └── package.json
└── DEPLOY.md             # Эта инструкция
```

