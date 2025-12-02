import { TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Forecast = ({ data }) => {
  if (!data || !data.forecast) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Загрузите выписку для просмотра прогноза</p>
        </div>
      </div>
    );
  }

  const { forecast } = data;

  const forecastData = [
    {
      month: 'Следующий месяц',
      total: forecast.nextMonth?.total || 0,
      ...(forecast.nextMonth?.byCategory || {})
    },
    {
      month: 'Через 2 месяца',
      total: forecast.month2?.total || 0,
      ...(forecast.month2?.byCategory || {})
    },
    {
      month: 'Через 3 месяца',
      total: forecast.month3?.total || 0,
      ...(forecast.month3?.byCategory || {})
    }
  ];

  const categoryKeys = new Set();
  forecastData.forEach(month => {
    Object.keys(month).forEach(key => {
      if (key !== 'month' && key !== 'total') {
        categoryKeys.add(key);
      }
    });
  });

  const chartData = Array.from(categoryKeys).map(category => ({
    name: category,
    'Следующий месяц': forecast.nextMonth?.byCategory?.[category] || 0,
    'Через 2 месяца': forecast.month2?.byCategory?.[category] || 0,
    'Через 3 месяца': forecast.month3?.byCategory?.[category] || 0,
  }));

  const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Прогноз расходов</h1>
        <p className="text-gray-600">Прогнозирование расходов на следующие 3 месяца на основе исторических данных</p>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forecastData.map((month, index) => (
          <div key={index} className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-xs text-gray-600">
                Уверенность: {Math.round((forecast.confidence || 0.7) * 100)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{month.month}</p>
            <p className="text-3xl font-bold text-blue-600">
              ₸{month.total.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>

      {/* Trends */}
      {forecast.trends && (
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Тренды и паттерны
          </h3>
          <p className="text-gray-700">{forecast.trends}</p>
        </div>
      )}

      {/* Total Forecast Chart */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Прогноз общих расходов</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₸${value.toLocaleString('kz-KZ')}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', r: 6 }}
              name="Общие расходы"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Forecast */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Прогноз по категориям</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `₸${value.toLocaleString('kz-KZ')}`} />
              <Legend />
              <Bar dataKey="Следующий месяц" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Через 2 месяца" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Через 3 месяца" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(forecast.nextMonth?.byCategory || {}).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(forecast.nextMonth.byCategory).map(([category, amount], index) => (
            <div key={index} className="card hover:shadow-xl transition-shadow">
              <p className="text-sm text-gray-600 mb-1">{category}</p>
              <p className="text-2xl font-bold text-gray-900">
                ₸{amount.toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Следующий месяц</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forecast;

