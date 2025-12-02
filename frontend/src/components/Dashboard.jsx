import { TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Загрузите выписку для просмотра аналитики</p>
        </div>
      </div>
    );
  }

  const { statistics, classifications, forecast } = data;

  const categoryData = Object.entries(statistics.categories || {}).map(([name, value]) => ({
    name,
    value: Math.abs(value)
  }));

  const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        text: 'text-blue-600',
        bg: 'bg-blue-100',
        icon: 'text-blue-600'
      },
      green: {
        text: 'text-green-600',
        bg: 'bg-green-100',
        icon: 'text-green-600'
      },
      red: {
        text: 'text-red-600',
        bg: 'bg-red-100',
        icon: 'text-red-600'
      },
      purple: {
        text: 'text-purple-600',
        bg: 'bg-purple-100',
        icon: 'text-purple-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const statsCards = [
    {
      title: 'Всего транзакций',
      value: statistics.totalTransactions || 0,
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Доходы',
      value: `₸${(statistics.totalIncome || 0).toLocaleString('kz-KZ')}`,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Расходы',
      value: `₸${(statistics.totalExpenses || 0).toLocaleString('kz-KZ')}`,
      icon: TrendingDown,
      color: 'red'
    },
    {
      title: 'Средняя транзакция',
      value: `₸${Math.abs(statistics.averageTransaction || 0).toLocaleString('kz-KZ', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'purple'
    }
  ];

  const balance = (statistics.totalIncome || 0) - (statistics.totalExpenses || 0);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Обзор финансов</h1>
        <p className="text-gray-600">Аналитика по вашей банковской выписке</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          return (
            <div key={index} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${colorClasses.text}`}>{stat.value}</p>
                </div>
                <div className={`p-3 ${colorClasses.bg} rounded-xl`}>
                  <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Balance Card */}
      <div className={`card ${balance >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Баланс</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₸{balance.toLocaleString('kz-KZ')}
            </p>
          </div>
          {balance >= 0 ? (
            <TrendingUp className="w-12 h-12 text-green-600" />
          ) : (
            <TrendingDown className="w-12 h-12 text-red-600" />
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Распределение по категориям</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₸${value.toLocaleString('kz-KZ')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Нет данных для отображения
            </div>
          )}
        </div>

        {/* Category Bar Chart */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Расходы по категориям</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `₸${value.toLocaleString('kz-KZ')}`} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Нет данных для отображения
            </div>
          )}
        </div>
      </div>

      {/* Forecast Preview */}
      {forecast && forecast.nextMonth && (
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Прогноз на следующий месяц
          </h3>
          <p className="text-2xl font-bold text-purple-600 mb-2">
            ₸{forecast.nextMonth.total?.toLocaleString('kz-KZ') || 'Н/Д'}
          </p>
          {forecast.trends && (
            <p className="text-gray-700">{forecast.trends}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

