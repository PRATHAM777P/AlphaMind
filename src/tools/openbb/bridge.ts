import { DynamicStructuredTool } from '@langchain/core/tools';
import { RunnableConfig } from '@langchain/core/runnables';
import { z } from 'zod';
import { formatToolResult } from '../types.js';
import { logger } from '../../utils/logger.js';

const OPENBB_API_URL = process.env.OPENBB_API_URL || 'http://localhost:8700';

interface OpenBBResponse {
  results: unknown[];
}

async function callOpenBB(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<{ data: unknown; url: string }> {
  const url = new URL(`${OPENBB_API_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const detail = `${response.status} ${response.statusText}`;
    logger.error(`[OpenBB] API error: ${endpoint} — ${detail}`);
    throw new Error(`[OpenBB] request failed: ${detail}`);
  }

  const data = await response.json();
  return { data, url: url.toString() };
}

const EquityDataSchema = z.object({
  symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, ASML, 7203.T)'),
  endpoint: z
    .enum([
      'price',
      'profile',
      'income',
      'balance',
      'cash_flow',
      'ratios',
      'quote',
      'estimates',
    ])
    .describe('Which data to retrieve'),
  start_date: z.string().optional().describe('Start date YYYY-MM-DD (for price history)'),
  end_date: z.string().optional().describe('End date YYYY-MM-DD (for price history)'),
  period: z.enum(['annual', 'quarter']).optional().describe('Reporting period for fundamentals'),
  limit: z.number().optional().describe('Number of results to return'),
  provider: z
    .string()
    .optional()
    .describe('Data provider override (yfinance, fmp, polygon, intrinio, tiingo)'),
});

const endpointMap: Record<string, string> = {
  price: '/api/v1/equity/price/historical',
  profile: '/api/v1/equity/profile',
  income: '/api/v1/equity/fundamental/income',
  balance: '/api/v1/equity/fundamental/balance',
  cash_flow: '/api/v1/equity/fundamental/cash',
  ratios: '/api/v1/equity/fundamental/ratios',
  quote: '/api/v1/equity/price/quote',
  estimates: '/api/v1/equity/estimates/consensus',
};

export const openbbEquityTool = new DynamicStructuredTool({
  name: 'openbb_equity',
  description:
    'Access comprehensive equity data via OpenBB Platform (100+ providers, global markets). Use for international stocks, detailed fundamentals, and data not available from Financial Datasets API.',
  schema: EquityDataSchema,
  func: async (
    input: z.infer<typeof EquityDataSchema>,
    _runManager?: unknown,
    config?: RunnableConfig
  ) => {
    const onProgress = (config?.metadata as Record<string, unknown>)?.onProgress as
      | ((msg: string) => void)
      | undefined;

    const apiPath = endpointMap[input.endpoint];
    if (!apiPath) {
      throw new Error(`Unknown endpoint: ${input.endpoint}`);
    }

    onProgress?.(`Fetching ${input.endpoint} data for ${input.symbol} from OpenBB...`);

    const params: Record<string, string | number | undefined> = {
      symbol: input.symbol,
      start_date: input.start_date,
      end_date: input.end_date,
      period: input.period,
      limit: input.limit,
      provider: input.provider,
    };

    const { data, url } = await callOpenBB(apiPath, params);
    return formatToolResult(data, [url]);
  },
});

const EconomySchema = z.object({
  indicator: z
    .enum(['gdp', 'cpi', 'unemployment', 'interest_rate', 'custom'])
    .describe('Economic indicator to query'),
  symbol: z
    .string()
    .optional()
    .describe('FRED series ID for custom indicators (e.g., GDP, CPIAUCSL, UNRATE, DFF)'),
  start_date: z.string().optional().describe('Start date YYYY-MM-DD'),
  end_date: z.string().optional().describe('End date YYYY-MM-DD'),
  provider: z.string().optional().describe('Data provider (fred, econdb, oecd)'),
});

const indicatorMap: Record<string, string> = {
  gdp: 'GDP',
  cpi: 'CPIAUCSL',
  unemployment: 'UNRATE',
  interest_rate: 'DFF',
};

export const openbbEconomyTool = new DynamicStructuredTool({
  name: 'openbb_economy',
  description:
    'Access macroeconomic data: GDP, CPI, unemployment, interest rates, and custom FRED series. Covers US and international economic indicators.',
  schema: EconomySchema,
  func: async (
    input: z.infer<typeof EconomySchema>,
    _runManager?: unknown,
    config?: RunnableConfig
  ) => {
    const onProgress = (config?.metadata as Record<string, unknown>)?.onProgress as
      | ((msg: string) => void)
      | undefined;

    const seriesId = input.indicator === 'custom' ? input.symbol : indicatorMap[input.indicator];
    if (!seriesId) {
      throw new Error(
        `Must provide symbol for custom indicator, or use one of: gdp, cpi, unemployment, interest_rate`
      );
    }

    onProgress?.(`Fetching ${input.indicator} data from OpenBB...`);

    const { data, url } = await callOpenBB('/api/v1/economy/fred_series', {
      symbol: seriesId,
      start_date: input.start_date,
      end_date: input.end_date,
      provider: input.provider || 'fred',
    });

    return formatToolResult(data, [url]);
  },
});

const ScreenerSchema = z.object({
  market_cap_min: z.number().optional().describe('Minimum market cap in USD'),
  market_cap_max: z.number().optional().describe('Maximum market cap in USD'),
  pe_ratio_min: z.number().optional().describe('Minimum P/E ratio'),
  pe_ratio_max: z.number().optional().describe('Maximum P/E ratio'),
  sector: z
    .string()
    .optional()
    .describe('Sector filter (Technology, Healthcare, Financial Services, etc.)'),
  country: z.string().optional().describe('Country filter (US, NL, JP, GB, etc.)'),
  exchange: z.string().optional().describe('Exchange filter (NYSE, NASDAQ, LSE, TSE, etc.)'),
  limit: z.number().optional().describe('Max results to return').default(20),
});

export const openbbScreenerTool = new DynamicStructuredTool({
  name: 'openbb_screener',
  description:
    'Screen stocks by financial metrics across global markets. Filter by market cap, P/E ratio, sector, country, and exchange.',
  schema: ScreenerSchema,
  func: async (
    input: z.infer<typeof ScreenerSchema>,
    _runManager?: unknown,
    config?: RunnableConfig
  ) => {
    const onProgress = (config?.metadata as Record<string, unknown>)?.onProgress as
      | ((msg: string) => void)
      | undefined;

    onProgress?.('Screening stocks via OpenBB...');

    const { data, url } = await callOpenBB('/api/v1/equity/screener', {
      market_cap_min: input.market_cap_min,
      market_cap_max: input.market_cap_max,
      sector: input.sector,
      country: input.country,
      exchange: input.exchange,
      limit: input.limit,
    });

    return formatToolResult(data, [url]);
  },
});

const NewsSchema = z.object({
  symbols: z.string().optional().describe('Comma-separated ticker symbols (e.g., AAPL,MSFT)'),
  limit: z.number().optional().describe('Number of articles to return').default(10),
  provider: z
    .string()
    .optional()
    .describe('News provider (benzinga, fmp, intrinio, tiingo, yfinance)'),
});

export const openbbNewsTool = new DynamicStructuredTool({
  name: 'openbb_news',
  description:
    'Search financial news by company ticker or general market news. Returns headlines, summaries, dates, and source URLs from multiple providers.',
  schema: NewsSchema,
  func: async (
    input: z.infer<typeof NewsSchema>,
    _runManager?: unknown,
    config?: RunnableConfig
  ) => {
    const onProgress = (config?.metadata as Record<string, unknown>)?.onProgress as
      | ((msg: string) => void)
      | undefined;

    onProgress?.(`Fetching news${input.symbols ? ` for ${input.symbols}` : ''}...`);

    const { data, url } = await callOpenBB('/api/v1/news/world', {
      symbols: input.symbols,
      limit: input.limit,
      provider: input.provider,
    });

    return formatToolResult(data, [url]);
  },
});
