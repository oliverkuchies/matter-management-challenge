import { FieldType } from "../../../types/types.js";

export interface FieldRow {
  id: string;
  account_id: number;
  name: string;
  field_type: FieldType;
  description: string | null;
  metadata: Record<string, unknown> | null;
  system_field: boolean;
}

export interface FieldOptionRow {
  id: string;
  label: string;
  sequence: number;
}

export interface StatusOptionRow {
  id: string;
  label: string;
  group_id: string;
  group_name: string;
  sequence: number;
}

export interface StatusGroupRow {
  id: string;
  name: string;
  sequence: number;
}

export interface CurrencyOptionRow {
  id: string;
  code: string;
  name: string;
  symbol: string;
  sequence: number;
}