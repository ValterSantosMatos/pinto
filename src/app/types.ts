export const CASH_SYMBOL = 'cash:usd';

export interface RebalanceItem {
  symbol: string;
  qtt: number;
  lastPrice: number;
  portfolioWeight: number;
  weight: number;
  result?: RebalanceResult;
}

export interface RebalanceResult {
  weight: number;
  qtt: number;
}
