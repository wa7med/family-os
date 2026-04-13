-- Add is_open_ended column to contracts for contracts without end date
ALTER TABLE contracts ADD COLUMN is_open_ended INTEGER DEFAULT 0;
