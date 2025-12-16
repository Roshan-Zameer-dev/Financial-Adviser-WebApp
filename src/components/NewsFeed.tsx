import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, TrendingUp, Clock } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    setLoading(true);

    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Bitcoin Surges Past $50,000 as Institutional Investment Grows',
        description: 'Major financial institutions are increasing their cryptocurrency holdings, driving Bitcoin to new highs. Analysts predict continued growth as adoption accelerates.',
        url: '#',
        source: 'Crypto Times',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: 'crypto',
      },
      {
        id: '2',
        title: 'Tech Stocks Rally on Strong Earnings Reports',
        description: 'Major technology companies exceeded quarterly expectations, leading to a broad market rally. The Nasdaq composite reached a new all-time high.',
        url: '#',
        source: 'Market Watch',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: 'stocks',
      },
      {
        id: '3',
        title: 'Federal Reserve Maintains Interest Rates, Signals Patience',
        description: 'The Federal Reserve announced it will maintain current interest rates while monitoring economic indicators. Markets responded positively to the measured approach.',
        url: '#',
        source: 'Financial News',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        category: 'economy',
      },
      {
        id: '4',
        title: 'Ethereum 2.0 Upgrade Shows Promising Performance Metrics',
        description: 'The recent Ethereum network upgrade has significantly reduced transaction fees and improved processing speeds, attracting new developers to the platform.',
        url: '#',
        source: 'Blockchain Daily',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        category: 'crypto',
      },
      {
        id: '5',
        title: 'Gold Prices Rise Amid Market Uncertainty',
        description: 'Investors are turning to traditional safe-haven assets as global economic uncertainty increases. Gold futures reached their highest level in six months.',
        url: '#',
        source: 'Commodity Report',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        category: 'commodities',
      },
      {
        id: '6',
        title: 'AI Stocks Lead Market Gains as Technology Sector Expands',
        description: 'Companies focused on artificial intelligence saw significant gains today. The sector continues to attract both institutional and retail investors.',
        url: '#',
        source: 'Tech Investor',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        category: 'stocks',
      },
      {
        id: '7',
        title: 'Decentralized Finance (DeFi) Protocols See Record Trading Volume',
        description: 'DeFi platforms reported unprecedented trading volumes this week, signaling growing mainstream adoption of decentralized financial services.',
        url: '#',
        source: 'DeFi News',
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        category: 'crypto',
      },
      {
        id: '8',
        title: 'Energy Sector Rebounds on Global Demand Increase',
        description: 'Oil and gas companies posted strong quarterly results as global energy demand continues to recover. Analysts remain optimistic about the sector.',
        url: '#',
        source: 'Energy Today',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        category: 'energy',
      },
      {
        id: '9',
        title: 'Emerging Markets ETFs Attract Record Investment Flows',
        description: 'Investors are diversifying into emerging market exchange-traded funds, seeking growth opportunities beyond developed economies.',
        url: '#',
        source: 'Global Investor',
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        category: 'stocks',
      },
      {
        id: '10',
        title: 'NFT Market Shows Signs of Maturation with Quality Focus',
        description: 'The non-fungible token market is evolving beyond speculation, with collectors focusing on high-quality digital art and utility-driven projects.',
        url: '#',
        source: 'Digital Assets Weekly',
        publishedAt: new Date(Date.now() - 36000000).toISOString(),
        category: 'crypto',
      },
    ];

    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 500);
  };

  const categories = [
    { id: 'all', label: 'All News' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'economy', label: 'Economy' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'energy', label: 'Energy' },
  ];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Newspaper className="w-6 h-6 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Finance News Feed</h2>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              selectedCategory === category.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No articles found for this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map(article => (
            <article
              key={article.id}
              className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded uppercase">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      {article.source}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium transition"
                    >
                      Read more
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          News updates every 5 minutes. Stay informed with the latest financial market trends.
        </p>
      </div>
    </div>
  );
}
