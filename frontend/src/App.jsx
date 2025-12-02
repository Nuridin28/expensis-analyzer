import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StatementUpload from './components/StatementUpload';
import Classifications from './components/Classifications';
import Subscriptions from './components/Subscriptions';
import Forecast from './components/Forecast';
import Recommendations from './components/Recommendations';
import { FileText, BarChart3, TrendingUp, Bell, Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { id: 'upload', label: 'Загрузка выписки', icon: FileText },
    { id: 'dashboard', label: 'Обзор', icon: BarChart3 },
    { id: 'classifications', label: 'Классификация', icon: FileText },
    { id: 'subscriptions', label: 'Подписки', icon: Bell },
    { id: 'forecast', label: 'Прогноз', icon: TrendingUp },
    { id: 'recommendations', label: 'Рекомендации', icon: Sparkles },
  ];

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <StatementUpload onAnalysisComplete={handleAnalysisComplete} loading={loading} setLoading={setLoading} />;
      case 'dashboard':
        return <Dashboard data={analysisData} />;
      case 'classifications':
        return <Classifications data={analysisData} />;
      case 'subscriptions':
        return <Subscriptions data={analysisData} />;
      case 'forecast':
        return <Forecast data={analysisData} />;
      case 'recommendations':
        return <Recommendations data={analysisData} />;
      default:
        return <StatementUpload onAnalysisComplete={handleAnalysisComplete} loading={loading} setLoading={setLoading} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        menuItems={menuItems}
        hasData={!!analysisData}
      />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;

