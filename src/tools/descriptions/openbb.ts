export const OPENBB_EQUITY_DESCRIPTION = `
Access comprehensive equity data via OpenBB Platform with 100+ data providers and global market coverage.

## When to Use
- International stocks not covered by Financial Datasets API (e.g., ASML, Toyota, LVMH)
- Detailed company profiles with sector, industry, and exchange info
- Historical prices with multiple provider options for data quality comparison
- Financial ratios (P/E, P/B, ROE, debt-to-equity) over time
- Real-time quotes with volume, market cap, and 52-week range
- Analyst consensus estimates and price targets

## When NOT to Use
- Basic US stock data already available from financial_search (prefer financial_search for US equities)
- Web searches or news (use web_search or openbb_news)
- Screening stocks (use openbb_screener)
- Macro data (use openbb_economy)

## Endpoints
- **price**: Historical OHLCV price data
- **profile**: Company info (sector, industry, market cap, description)
- **income**: Income statement (revenue, net income, EPS)
- **balance**: Balance sheet (assets, liabilities, equity)
- **cash_flow**: Cash flow statement (operating, investing, financing)
- **ratios**: Financial ratios (P/E, ROE, current ratio, etc.)
- **quote**: Real-time or latest price quote
- **estimates**: Analyst consensus estimates

## Providers
yfinance (default, free), fmp, polygon, intrinio, tiingo, benzinga

## Usage Notes
- Call ONCE per ticker per endpoint — results are comprehensive
- For multiple tickers, make separate calls
- Provider can be overridden if default data quality is insufficient
`.trim();

export const OPENBB_ECONOMY_DESCRIPTION = `
Access macroeconomic indicators and economic data via OpenBB Platform.

## When to Use
- US economic data: GDP growth, CPI inflation, unemployment rate, Fed funds rate
- Custom FRED series for specialized economic analysis
- Economic context for stock valuation (rates environment, growth outlook)

## When NOT to Use
- Company-specific data (use openbb_equity or financial_search)
- Stock screening (use openbb_screener)
- News (use openbb_news or web_search)

## Built-in Indicators
- **gdp**: US GDP (FRED: GDP)
- **cpi**: Consumer Price Index (FRED: CPIAUCSL)
- **unemployment**: US Unemployment Rate (FRED: UNRATE)
- **interest_rate**: Fed Funds Rate (FRED: DFF)
- **custom**: Any FRED series ID

## Usage Notes
- Use 'custom' indicator with a FRED symbol for specialized series
- Date filtering via start_date/end_date
`.trim();

export const OPENBB_SCREENER_DESCRIPTION = `
Screen stocks across global markets by financial metrics.

## When to Use
- Finding stocks matching specific criteria (value screens, growth screens)
- Filtering by sector, country, or exchange
- Market cap and valuation-based screening

## When NOT to Use
- Looking up a specific known company (use openbb_equity)
- Searching for news or events (use openbb_news)
- Macro analysis (use openbb_economy)

## Filters
- market_cap_min/max: Market capitalization bounds (USD)
- pe_ratio_min/max: Price-to-earnings bounds (not yet natively filtered — post-process)
- sector: Technology, Healthcare, Financial Services, Energy, etc.
- country: US, NL, JP, GB, DE, etc.
- exchange: NYSE, NASDAQ, LSE, TSE, etc.

## Usage Notes
- Returns up to 'limit' results (default: 20)
- Combine multiple filters for targeted screens
- Available via FMP provider — requires FMP API key for full functionality
`.trim();

export const OPENBB_NEWS_DESCRIPTION = `
Search and retrieve financial news from multiple providers.

## When to Use
- Company-specific news for a ticker
- General market/sector news
- Recent developments affecting stock price

## When NOT to Use
- General web search (use web_search)
- Company fundamentals (use openbb_equity or financial_search)
- Historical data (use openbb_equity with price endpoint)

## Providers
benzinga, fmp, intrinio, tiingo, yfinance

## Usage Notes
- Pass comma-separated symbols for multi-company news
- Default limit is 10 articles
- Returns headlines, summaries, dates, and source URLs
`.trim();
