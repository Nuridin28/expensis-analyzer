import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader, Sparkles, File } from 'lucide-react';
import { analyzeStatement, parsePDF } from '../services/api';

const StatementUpload = ({ onAnalysisComplete, loading, setLoading }) => {
  const [statement, setStatement] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const exampleStatement = [
    {
      "дата": "2024-01-15",
      "сумма": -1500,
      "операция": "Покупка",
      "детали": "Супермаркет Ашан"
    },
    {
      "дата": "2024-01-16",
      "сумма": -500,
      "операция": "Оплата",
      "детали": "Netflix подписка"
    },
    {
      "дата": "2024-01-17",
      "сумма": 50000,
      "операция": "Поступление",
      "детали": "Зарплата"
    },
    {
      "дата": "2024-01-18",
      "сумма": -300,
      "операция": "Оплата",
      "детали": "Такси Uber"
    },
    {
      "дата": "2024-01-19",
      "сумма": -2500,
      "операция": "Покупка",
      "детали": "Ресторан"
    }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError('Файл не выбран');
      return;
    }

    // Проверяем размер файла (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }

    // Если это PDF, отправляем на сервер для парсинга
    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      setLoading(true);
      setError('');
      setSuccess('');
      
      try {
        const result = await parsePDF(file);
        
        if (result.success && result.data && result.data.statement) {
          const transactions = result.data.statement;
          setStatement(JSON.stringify(transactions, null, 2));
          setSuccess(`PDF файл "${file.name}" успешно обработан. Извлечено ${transactions.length} транзакций.`);
          
          // Автоматически запускаем анализ
          setTimeout(() => {
            handleAnalyzeFromData(transactions);
          }, 500);
        } else {
          throw new Error('Не удалось извлечь данные из PDF');
        }
      } catch (err) {
        console.error('PDF parsing error:', err);
        setError('Ошибка при обработке PDF: ' + err.message);
        setStatement('');
      } finally {
        setLoading(false);
        e.target.value = '';
      }
      return;
    }

    // Для JSON и CSV обрабатываем локально
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        if (!content || content.trim() === '') {
          throw new Error('Файл пустой');
        }

        let parsed;
        
        if (file.name.endsWith('.json')) {
          try {
            parsed = JSON.parse(content);
          } catch (parseErr) {
            throw new Error('Неверный формат JSON: ' + parseErr.message);
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error('CSV файл должен содержать заголовки и хотя бы одну строку данных');
          }
          
          // Улучшенный парсинг CSV с учетом кавычек
          const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };
          
          const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
          parsed = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const obj = {};
            headers.forEach((header, index) => {
              let value = values[index] || '';
              value = value.replace(/^"|"$/g, ''); // Убираем кавычки
              // Пытаемся преобразовать в число если это поле "сумма" или "amount"
              if ((header === 'сумма' || header === 'amount') && !isNaN(value)) {
                obj[header] = parseFloat(value);
              } else {
                obj[header] = value;
              }
            });
            return obj;
          }).filter(obj => Object.keys(obj).length > 0);
        } else {
          throw new Error('Неподдерживаемый формат файла. Поддерживаются .json, .csv и .pdf');
        }
        
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Файл должен содержать массив транзакций');
        }
        
        setStatement(JSON.stringify(parsed, null, 2));
        setError('');
        setSuccess(`Файл "${file.name}" успешно загружен. Найдено ${parsed.length} транзакций.`);
      } catch (err) {
        console.error('File upload error:', err);
        setError('Ошибка при чтении файла: ' + err.message);
        setStatement('');
      }
    };
    
    reader.onerror = () => {
      setError('Ошибка при чтении файла');
      setStatement('');
    };
    
    reader.readAsText(file, 'UTF-8');
    
    // Сброс input для возможности загрузить тот же файл снова
    e.target.value = '';
  };

  const handleAnalyzeFromData = async (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setError('Нет данных для анализа');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await analyzeStatement(data);
      
      if (result.success) {
        setSuccess('Анализ выполнен успешно!');
        onAnalysisComplete(result.data);
      } else {
        throw new Error(result.error || 'Ошибка при анализе');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Произошла ошибка при анализе выписки');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!statement.trim()) {
      setError('Пожалуйста, введите или загрузите выписку');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let parsedStatement;
      
      // Парсим JSON
      try {
        parsedStatement = JSON.parse(statement);
      } catch (e) {
        throw new Error('Неверный формат JSON. Проверьте синтаксис.');
      }

      if (!Array.isArray(parsedStatement)) {
        throw new Error('Выписка должна быть массивом транзакций');
      }

      if (parsedStatement.length === 0) {
        throw new Error('Выписка не может быть пустой');
      }

      // Проверяем наличие обязательных полей
      const sample = parsedStatement[0];
      const hasRequiredFields = 
        (sample.дата || sample.date || sample['Дата']) &&
        (sample.сумма !== undefined || sample.amount !== undefined || sample['Сумма'] !== undefined) &&
        (sample.операция || sample.operation || sample['Операция']) &&
        (sample.детали || sample.details || sample['Детали']);

      if (!hasRequiredFields) {
        throw new Error('Выписка должна содержать поля: дата, сумма, операция, детали');
      }

      // Нормализуем поля
      const normalizedStatement = parsedStatement.map(transaction => ({
        дата: transaction.дата || transaction.date || transaction['Дата'] || '',
        сумма: parseFloat(transaction.сумма || transaction.amount || transaction['Сумма'] || 0),
        операция: transaction.операция || transaction.operation || transaction['Операция'] || '',
        детали: transaction.детали || transaction.details || transaction['Детали'] || ''
      }));

      await handleAnalyzeFromData(normalizedStatement);
    } catch (err) {
      setError(err.message || 'Произошла ошибка при анализе выписки');
      setLoading(false);
    }
  };

  const loadExample = () => {
    setStatement(JSON.stringify(exampleStatement, null, 2));
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Анализ банковских выписок
        </h1>
        <p className="text-gray-600 text-lg">
          Загрузите выписку в формате JSON, CSV или PDF для анализа ваших финансов
        </p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <label 
            htmlFor="file-upload"
            className="flex-1 cursor-pointer block"
          >
            <input
              type="file"
              accept=".json,.csv,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <div className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors bg-gray-50">
              {loading ? (
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-gray-600" />
              )}
              <span className="text-gray-700 font-medium">
                {loading ? 'Обработка файла...' : 'Загрузить файл (JSON/CSV/PDF)'}
              </span>
            </div>
          </label>
          
          <button
            onClick={loadExample}
            disabled={loading}
            className="btn-secondary whitespace-nowrap"
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Загрузить пример
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Или вставьте данные вручную (JSON):
          </label>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder='[{"дата": "2024-01-15", "сумма": -1500, "операция": "Покупка", "детали": "Супермаркет"}]'
            className="w-full h-64 p-4 border border-gray-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !statement.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 inline mr-2 animate-spin" />
              Анализирую выписку...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 inline mr-2" />
              Начать анализ
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Поддерживаемые форматы
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <File className="w-4 h-4 text-green-600" />
              <strong>PDF</strong> - банковские выписки в PDF формате (автоматическое извлечение данных)
            </li>
            <li className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <strong>JSON</strong> - структурированные данные
            </li>
            <li className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <strong>CSV</strong> - табличные данные
            </li>
          </ul>
        </div>
        
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Формат данных
          </h3>
          <p className="text-sm text-gray-700 mb-2">
            Выписка должна содержать поля:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li><strong>дата</strong> - дата транзакции</li>
            <li><strong>сумма</strong> - сумма (отрицательная для расходов)</li>
            <li><strong>операция</strong> - тип операции</li>
            <li><strong>детали</strong> - описание транзакции</li>
          </ul>
          <p className="text-xs text-gray-600 mt-2">
            Для PDF: данные извлекаются автоматически с помощью AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatementUpload;

