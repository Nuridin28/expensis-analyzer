# ✅ Быстрая проверка деплоя

## Статус сервисов

- ✅ **Backend**: https://expensis-analyzer.onrender.com (работает)
- ✅ **Frontend**: https://expensis-analyzer.vercel.app/ (задеплоен)

## ⚠️ Важно: Проверьте переменную окружения в Vercel!

Для того чтобы frontend мог подключаться к backend, нужно установить переменную окружения в Vercel:

### Шаги:

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект `expensis-analyzer` (или ваш проект)
3. Перейдите в **Settings** → **Environment Variables**
4. Проверьте, есть ли переменная:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://expensis-analyzer.onrender.com` (без слеша в конце!)

5. Если переменной нет или она неправильная:
   - Нажмите **"Add New"**
   - Key: `VITE_API_URL`
   - Value: `https://expensis-analyzer.onrender.com`
   - Выберите все окружения: Production, Preview, Development
   - Сохраните

6. **ВАЖНО**: После изменения переменной сделайте **Redeploy**:
   - Перейдите в **Deployments**
   - Найдите последний деплой
   - Нажмите три точки (⋯) → **Redeploy**

## Тест подключения

После настройки переменной и redeploy:

1. Откройте https://expensis-analyzer.vercel.app/
2. Откройте консоль браузера (F12)
3. Попробуйте загрузить пример выписки
4. Проверьте в Network tab, что запросы идут на `expensis-analyzer.onrender.com`
5. Не должно быть ошибок CORS или 404

## Если всё работает ✅

Поздравляю! Ваше приложение полностью задеплоено и работает!

- Frontend: https://expensis-analyzer.vercel.app/
- Backend: https://expensis-analyzer.onrender.com

