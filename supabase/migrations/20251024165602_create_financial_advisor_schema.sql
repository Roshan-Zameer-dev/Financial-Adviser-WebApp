/*
  # Financial Advisor App Database Schema

  ## Overview
  This migration creates the core database structure for a financial advisor application
  with investment portfolio tracking, simulations, and user preferences.

  ## New Tables

  ### 1. `portfolios`
  Stores user portfolios with metadata
  - `id` (uuid, primary key) - Unique portfolio identifier
  - `user_id` (uuid) - Reference to auth.users (future auth integration)
  - `name` (text) - Portfolio name
  - `description` (text, nullable) - Optional portfolio description
  - `created_at` (timestamptz) - When the portfolio was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `investments`
  Individual investment holdings within portfolios
  - `id` (uuid, primary key) - Unique investment identifier
  - `portfolio_id` (uuid, foreign key) - Reference to portfolios table
  - `symbol` (text) - Ticker symbol (e.g., BTC, AAPL, ETH)
  - `name` (text) - Investment name
  - `asset_type` (text) - Type: 'stock', 'crypto', 'etf', 'other'
  - `quantity` (numeric) - Number of shares/coins owned
  - `purchase_price` (numeric) - Price per unit at purchase
  - `purchase_date` (timestamptz) - When the investment was purchased
  - `notes` (text, nullable) - Optional notes about the investment
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `simulations`
  Saved investment simulation scenarios
  - `id` (uuid, primary key) - Unique simulation identifier
  - `user_id` (uuid) - Reference to auth.users (future auth integration)
  - `name` (text) - Simulation name
  - `initial_amount` (numeric) - Starting investment amount
  - `annual_return` (numeric) - Expected annual return rate (percentage)
  - `years` (integer) - Investment time horizon in years
  - `monthly_contribution` (numeric) - Regular monthly additions
  - `created_at` (timestamptz) - When the simulation was saved

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - For now, policies allow public access to enable development
  - Future update will restrict access to authenticated users only

  ## Important Notes
  - All tables use UUID primary keys with automatic generation
  - Timestamps are automatically managed with defaults and triggers
  - Numeric types are used for financial calculations to maintain precision
  - Foreign key constraints ensure data integrity between portfolios and investments
*/

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  asset_type text NOT NULL DEFAULT 'stock',
  quantity numeric NOT NULL DEFAULT 0,
  purchase_price numeric NOT NULL DEFAULT 0,
  purchase_date timestamptz DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  name text NOT NULL,
  initial_amount numeric NOT NULL,
  annual_return numeric NOT NULL,
  years integer NOT NULL,
  monthly_contribution numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id ON investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_investments_symbol ON investments(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (development mode)
-- These allow anyone to read, create, update, and delete data
-- In production, these should be restricted to authenticated users

CREATE POLICY "Allow public read access to portfolios"
  ON portfolios FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to portfolios"
  ON portfolios FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to portfolios"
  ON portfolios FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to investments"
  ON investments FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to investments"
  ON investments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to investments"
  ON investments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to investments"
  ON investments FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to simulations"
  ON simulations FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to simulations"
  ON simulations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to simulations"
  ON simulations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to simulations"
  ON simulations FOR DELETE
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to auto-update updated_at columns
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();