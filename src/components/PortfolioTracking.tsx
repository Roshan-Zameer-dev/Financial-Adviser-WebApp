import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
}

interface Investment {
  id: string;
  portfolio_id: string;
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  notes: string | null;
}

interface PriceData {
  [symbol: string]: number;
}

export default function PortfolioTracking() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [prices, setPrices] = useState<PriceData>({});

  const [investmentForm, setInvestmentForm] = useState({
    symbol: '',
    name: '',
    asset_type: 'stock',
    quantity: '',
    purchase_price: '',
  });

  const loadPortfolios = useCallback(async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPortfolios(data);
      if (data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0].id);
      }
    }
  }, [selectedPortfolio]);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  const loadInvestments = async (portfolioId: string) => {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvestments(data);
    }
  };

  const fetchPrices = useCallback(async () => {
    const symbols = investments.map(inv => inv.symbol);
    const mockPrices: PriceData = {};

    symbols.forEach(symbol => {
      const investment = investments.find(inv => inv.symbol === symbol);
      if (investment) {
        const basePrice = investment.purchase_price;
        const volatility = Math.random() * 0.2 - 0.1;
        mockPrices[symbol] = basePrice * (1 + volatility);
      }
    });

    setPrices(mockPrices);
  }, [investments]);

  useEffect(() => {
    if (selectedPortfolio) {
      loadInvestments(selectedPortfolio);
    }
  }, [selectedPortfolio]);

  useEffect(() => {
    if (investments.length > 0) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000);
      return () => clearInterval(interval);
    }
  }, [investments, fetchPrices]);

  const createPortfolio = async () => {
    if (!portfolioName.trim()) return;

    const { data, error } = await supabase
      .from('portfolios')
      .insert({ name: portfolioName, description: portfolioDesc })
      .select()
      .single();

    if (!error && data) {
      setPortfolios([data, ...portfolios]);
      setSelectedPortfolio(data.id);
      setPortfolioName('');
      setPortfolioDesc('');
      setShowPortfolioModal(false);
    }
  };

  const deletePortfolio = async (id: string) => {
    const { error } = await supabase.from('portfolios').delete().eq('id', id);

    if (!error) {
      setPortfolios(portfolios.filter(p => p.id !== id));
      if (selectedPortfolio === id) {
        setSelectedPortfolio(portfolios[0]?.id || null);
      }
    }
  };

  const addInvestment = async () => {
    if (!selectedPortfolio || !investmentForm.symbol || !investmentForm.name) return;

    const { data, error } = await supabase
      .from('investments')
      .insert({
        portfolio_id: selectedPortfolio,
        symbol: investmentForm.symbol.toUpperCase(),
        name: investmentForm.name,
        asset_type: investmentForm.asset_type,
        quantity: parseFloat(investmentForm.quantity) || 0,
        purchase_price: parseFloat(investmentForm.purchase_price) || 0,
      })
      .select()
      .single();

    if (!error && data) {
      setInvestments([data, ...investments]);
      setInvestmentForm({
        symbol: '',
        name: '',
        asset_type: 'stock',
        quantity: '',
        purchase_price: '',
      });
      setShowInvestmentModal(false);
    }
  };

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);

    if (!error) {
      setInvestments(investments.filter(inv => inv.id !== id));
    }
  };

  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioInvestments = investments.filter(inv => inv.portfolio_id === selectedPortfolio);

  const totalValue = portfolioInvestments.reduce((sum, inv) => {
    const currentPrice = prices[inv.symbol] || inv.purchase_price;
    return sum + (inv.quantity * currentPrice);
  }, 0);

  const totalCost = portfolioInvestments.reduce((sum, inv) => {
    return sum + (inv.quantity * inv.purchase_price);
  }, 0);

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Tracking</h2>
        </div>
        <button
          onClick={() => setShowPortfolioModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No portfolios yet. Create one to start tracking!</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {portfolios.map(portfolio => (
              <div key={portfolio.id} className="relative group">
                <button
                  onClick={() => setSelectedPortfolio(portfolio.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedPortfolio === portfolio.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {portfolio.name}
                </button>
                {selectedPortfolio === portfolio.id && (
                  <button
                    onClick={() => deletePortfolio(portfolio.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {currentPortfolio && (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                  totalGain >= 0
                    ? 'from-emerald-50 to-teal-50 border-emerald-100'
                    : 'from-red-50 to-rose-50 border-red-100'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Total Gain/Loss</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {totalGain >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className={`text-sm font-medium ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Holdings</h3>
                <button
                  onClick={() => setShowInvestmentModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Investment
                </button>
              </div>

              {portfolioInvestments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No investments in this portfolio yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolioInvestments.map(investment => {
                    const currentPrice = prices[investment.symbol] || investment.purchase_price;
                    const value = investment.quantity * currentPrice;
                    const cost = investment.quantity * investment.purchase_price;
                    const gain = value - cost;
                    const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

                    return (
                      <div
                        key={investment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{investment.symbol}</h4>
                              <p className="text-sm text-gray-500">{investment.name}</p>
                            </div>
                            <span className="px-2 py-1 bg-white text-xs font-medium text-gray-600 rounded border border-gray-200">
                              {investment.asset_type}
                            </span>
                          </div>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>{investment.quantity} shares</span>
                            <span>Avg: ${investment.purchase_price.toFixed(2)}</span>
                            <span>Current: ${currentPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className={`text-sm font-medium ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {gain >= 0 ? '+' : ''}${Math.abs(gain).toFixed(2)} ({gain >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                          </p>
                        </div>
                        <button
                          onClick={() => deleteInvestment(investment.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Portfolio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Name</label>
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Investment Portfolio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={portfolioDesc}
                  onChange={(e) => setPortfolioDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Long-term growth investments..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPortfolioModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createPortfolio}
                  disabled={!portfolioName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Investment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  value={investmentForm.symbol}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, symbol: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="AAPL, BTC, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={investmentForm.name}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Apple Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                <select
                  value={investmentForm.asset_type}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, asset_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="etf">ETF</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={investmentForm.quantity}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                    step="0.00000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    value={investmentForm.purchase_price}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, purchase_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInvestmentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addInvestment}
                  disabled={!investmentForm.symbol || !investmentForm.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
