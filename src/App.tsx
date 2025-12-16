import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Newspaper, Menu, X, LogOut } from 'lucide-react';
import InvestmentSimulator from './components/InvestmentSimulator';
import PortfolioTracking from './components/PortfolioTracking';
import NewsFeed from './components/NewsFeed';
// import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

type Tab = 'simulator' | 'portfolio' | 'news';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('simulator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
        setError('Failed to fetch session. Please check your Supabase configuration and network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    });

    return () => subscription.unsubscribe();
  }, []);

  const tabs = [
    { id: 'simulator' as Tab, label: 'Investment Simulator', icon: TrendingUp },
    { id: 'portfolio' as Tab, label: 'Portfolio Tracking', icon: Wallet },
    { id: 'news' as Tab, label: 'News Feed', icon: Newspaper },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  }

  if (!session) {
    // return <Auth />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Financial Advisor</h1>
                <p className="text-xs text-gray-500">Smart Investment Tools</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'simulator' && <InvestmentSimulator />}
        {activeTab === 'portfolio' && <PortfolioTracking />}
        {activeTab === 'news' && <NewsFeed />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Financial Advisor - Built with modern investment tracking tools
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;