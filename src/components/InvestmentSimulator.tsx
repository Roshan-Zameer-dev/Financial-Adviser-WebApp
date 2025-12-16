import { useState } from "react";
import { TrendingUp, Zap } from "lucide-react";

interface InvestmentSuggestion {
  name: string;
  symbol: string;
  invest: number;
  price: number | string;
}

interface InvestmentData {
  stockSuggestions: InvestmentSuggestion[];
  cryptoSuggestions: InvestmentSuggestion[];
}

export default function InvestmentSimulator() {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🪙 Fetch live crypto prices from CoinGecko
  const getCryptoPrices = async (ids: string[]) => {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(
      ","
    )}&vs_currencies=inr`;
    const res = await fetch(url);
    return res.json();
  };

  // 📈 Fetch live Indian stock prices (Yahoo Finance via proxy)
  const getStockPrices = async (symbols: string[]) => {
    const proxy = "https://api.allorigins.win/get?url=";
    const results = [];

    for (const sym of symbols) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d`;
      try {
        const res = await fetch(proxy + encodeURIComponent(url));
        const data = await res.json();
        const parsed = JSON.parse(data.contents);
        const price = parsed?.chart?.result?.[0]?.meta?.regularMarketPrice;
        results.push({ symbol: sym, price: price || "N/A" });
      } catch {
        results.push({ symbol: sym, price: "N/A" });
      }
    }

    return results;
  };

  const handleSuggest = async () => {
    const amount = parseFloat(investmentAmount);
    if (!investmentAmount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    setError(null);
    setLoading(true);
    setInvestmentData(null);

    try {
      let stockSymbols: string[] = [];
      let cryptoIds: string[] = [];

      // Safe and dynamic allocation
      if (riskLevel === "low") {
        stockSymbols = ["RELIANCE.NS", "HDFCBANK.NS", "TCS.NS"];
        cryptoIds = ["bitcoin", "ethereum"];
      } else if (riskLevel === "medium") {
        stockSymbols = ["INFY.NS", "ICICIBANK.NS", "TCS.NS"];
        cryptoIds = ["bitcoin", "ethereum", "binancecoin"];
      } else if (riskLevel === "high") {
        stockSymbols = ["ADANIENT.NS", "TATAMOTORS.NS", "ZOMATO.NS"];
        cryptoIds = ["bitcoin", "ethereum", "solana"];
      }

      // Fetch live prices
      const [cryptoData, stockData] = await Promise.all([
        getCryptoPrices(cryptoIds),
        getStockPrices(stockSymbols),
      ]);

      // Build crypto suggestions (limit to 2–3, safe allocation)
      const cryptoSuggestions = cryptoIds.slice(0, 3).map((id: string) => ({
        name: id.charAt(0).toUpperCase() + id.slice(1),
        symbol: id.toUpperCase(),
        invest: Math.floor((amount * (riskLevel === "low" ? 0.3 : riskLevel === "medium" ? 0.4 : 0.5)) / cryptoIds.length),
        price: cryptoData[id]?.inr || "N/A",
      }));

      // Build stock suggestions (limit to 3)
      const stockSuggestions = stockData.slice(0, 3).map((s: any) => ({
        name: s.symbol.replace(".NS", ""),
        symbol: s.symbol,
        invest: Math.floor((amount * (riskLevel === "low" ? 0.7 : riskLevel === "medium" ? 0.6 : 0.5)) / stockSymbols.length),
        price: s.price || "N/A",
      }));

      setInvestmentData({ stockSuggestions, cryptoSuggestions });
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching live prices.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Zap className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          AI Investment Advisor
        </h2>
      </div>

      <div className="p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">Disclaimer</p>
        <p>
          This is a simulated investment advisor. Only safe, well-known stocks and top cryptos are suggested. Always consult a financial advisor before investing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Panel */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Investment Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Risk Level
            </label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskLevel(level)}
                  className={`flex-1 px-4 py-2 rounded-lg transition capitalize ${
                    riskLevel === level
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSuggest}
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              {loading ? "Fetching Live Data..." : "Get Suggestions"}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {loading && <p>Loading suggestions...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {investmentData && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Suggested Investments (Live Prices)
              </h3>

              {/* Stocks Section */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-700 mb-2">
                  📈 Stock Investment Plan:
                </h4>
                <div className="space-y-3">
                  {investmentData.stockSuggestions.map((stock: InvestmentSuggestion, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-900">
                          {stock.name} ({stock.symbol})
                        </p>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            ₹{stock.price !== "N/A" ? stock.price.toLocaleString("en-IN") : "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Invest ₹{stock.invest.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crypto Section */}
              <div>
                <h4 className="font-bold text-gray-700 mb-2">
                  💰 Crypto Investment Plan:
                </h4>
                <div className="space-y-3">
                  {investmentData.cryptoSuggestions.map((crypto: InvestmentSuggestion, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-900">
                          {crypto.name} ({crypto.symbol})
                        </p>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            ₹{crypto.price !== "N/A" ? crypto.price.toLocaleString("en-IN") : "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Invest ₹{crypto.invest.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
