import { FieldType, CurrencyValue } from "../../../types/types.js";

export interface StatusOptionRow {
  id: string;
  label: string;
  sequence: number;
}

export interface CountRow {
  total: string;
}

export interface MatterRow {
  id: string;
  board_id: string;
  created_at: string;
  updated_at: string;
}

export interface FieldValueRow {
  id: string;
  ticket_field_id: string;
  field_name: string;
  field_type: FieldType;
  text_value: string | null;
  string_value: string | null;
  number_value: string | null;
  date_value: Date | null;
  boolean_value: boolean | null;
  currency_value: CurrencyValue | null;
  user_value: number | null;
  select_reference_value_uuid: string | null;
  status_reference_value_uuid: string | null;
  user_id: number | null;
  user_email: string | null;
  user_first_name: string | null;
  user_last_name: string | null;
  select_option_label: string | null;
  status_option_label: string | null;
  status_group_name: string | null;
}

export interface CurrentStatusRow {
  status_reference_value_uuid: string;
}

export interface TicketingTimeEntryRow {
  id: string; 
  status_from: string; 
  status_to: string; 
  changed_at: string;
  name: string;
  total_duration_ms: number;
}