-- Matter Management MVP Database Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Accounts table
CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ticketing board table
CREATE TABLE ticketing_board (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Field status groups (To Do, In Progress, Done)
CREATE TABLE ticketing_field_status_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id),
    name VARCHAR(255) NOT NULL,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    deleted_by INTEGER REFERENCES users(id)
);

-- Field definitions
CREATE TABLE ticketing_fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id),
    name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'number', 'select', 'date', 'currency', 'boolean', 'status', 'user')),
    description TEXT,
    metadata JSONB,
    system_field BOOLEAN DEFAULT FALSE NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Select field options
CREATE TABLE ticketing_field_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_field_id UUID NOT NULL REFERENCES ticketing_fields(id),
    label VARCHAR(255) NOT NULL,
    sequence INTEGER NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Status field options (linked to status groups)
CREATE TABLE ticketing_field_status_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_field_id UUID NOT NULL REFERENCES ticketing_fields(id),
    group_id UUID NOT NULL REFERENCES ticketing_field_status_groups(id),
    label VARCHAR(255) NOT NULL,
    sequence INTEGER NOT NULL,
    metadata JSONB,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    deleted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    restored_at TIMESTAMP WITH TIME ZONE,
    restored_by INTEGER REFERENCES users(id)
);

-- Currency options
CREATE TABLE ticketing_currency_field_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id),
    code VARCHAR(8) NOT NULL,
    name VARCHAR(64) NOT NULL,
    symbol VARCHAR(8) NOT NULL,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Ticketing tickets (matters)
CREATE TABLE ticketing_ticket (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES ticketing_board(id),
    platform_type VARCHAR(50) DEFAULT 'web' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ticket field values (EAV pattern)
CREATE TABLE ticketing_ticket_field_value (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES ticketing_ticket(id) ON DELETE CASCADE,
    ticket_field_id UUID NOT NULL REFERENCES ticketing_fields(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    -- Value columns for different field types
    text_value TEXT,
    string_value VARCHAR(255),
    number_value NUMERIC,
    date_value TIMESTAMP WITH TIME ZONE,
    user_value INTEGER REFERENCES users(id),
    boolean_value BOOLEAN,
    currency_value JSONB, -- {amount: number, currency: string}
    select_reference_value_uuid UUID REFERENCES ticketing_field_options(id),
    status_reference_value_uuid UUID REFERENCES ticketing_field_status_options(id),
    UNIQUE(ticket_id, ticket_field_id)
);

-- Cycle time history for tracking status transitions
CREATE TABLE ticketing_cycle_time_histories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES ticketing_ticket(id) ON DELETE CASCADE,
    status_field_id UUID NOT NULL REFERENCES ticketing_fields(id),
    from_status_id UUID REFERENCES ticketing_field_status_options(id),
    to_status_id UUID NOT NULL REFERENCES ticketing_field_status_options(id),
    transitioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_ticketing_ticket_board_id ON ticketing_ticket(board_id);
CREATE INDEX idx_ticket_field_value_ticket_id ON ticketing_ticket_field_value(ticket_id);
CREATE INDEX idx_ticket_field_value_field_id ON ticketing_ticket_field_value(ticket_field_id);
CREATE INDEX idx_ticket_field_value_status_ref ON ticketing_ticket_field_value(status_reference_value_uuid);
CREATE INDEX idx_cycle_time_histories_ticket_id ON ticketing_cycle_time_histories(ticket_id);
CREATE INDEX idx_cycle_time_histories_status_field ON ticketing_cycle_time_histories(status_field_id);
CREATE INDEX idx_cycle_time_histories_to_status ON ticketing_cycle_time_histories(to_status_id);
CREATE INDEX idx_cycle_time_histories_from_status ON ticketing_cycle_time_histories(from_status_id);
CREATE INDEX idx_cycle_time_histories_transitioned_at ON ticketing_cycle_time_histories(transitioned_at);
CREATE INDEX idx_status_options_group_id ON ticketing_field_status_options(group_id);

-- Indexes for text search
CREATE INDEX idx_ticket_field_value_text_trgm ON ticketing_ticket_field_value USING gin (text_value gin_trgm_ops);
CREATE INDEX idx_ticket_field_value_string_trgm ON ticketing_ticket_field_value USING gin (string_value gin_trgm_ops);

-- Indexes for sorting and filtering
CREATE INDEX idx_ticket_field_value_number ON ticketing_ticket_field_value(number_value);
CREATE INDEX idx_ticket_field_value_date ON ticketing_ticket_field_value(date_value);
CREATE INDEX idx_ticketing_ticket_created_at ON ticketing_ticket(created_at);

-- Create the materialized view for searching and sorting tickets
CREATE MATERIALIZED VIEW ticket_search_index AS
SELECT 
  tt.id,
  tt.board_id,
  tt.created_at,
  tt.updated_at,
  -- Concatenate all field values into a single searchable text column
  string_agg(
    COALESCE(
      CASE tf.field_type
        WHEN 'text'     THEN ttfv.text_value
        WHEN 'string'   THEN ttfv.string_value
        WHEN 'number'   THEN ttfv.number_value::text
        WHEN 'date'     THEN ttfv.date_value::text
        WHEN 'boolean'  THEN ttfv.boolean_value::text
        WHEN 'user'     THEN ttfv.user_value::text
        WHEN 'select'   THEN ttfv.select_reference_value_uuid::text
        WHEN 'status'   THEN ttfv.status_reference_value_uuid::text
        WHEN 'currency' THEN ttfv.currency_value::text
      END,
      ''
    ),
    ' '
  ) as searchable_text,
  to_tsvector('english', 
    string_agg(
      COALESCE(
        CASE tf.field_type
          WHEN 'text'     THEN ttfv.text_value
          WHEN 'string'   THEN ttfv.string_value
          WHEN 'number'   THEN ttfv.number_value::text
          WHEN 'date'     THEN ttfv.date_value::text
          WHEN 'boolean'  THEN ttfv.boolean_value::text
          WHEN 'user'     THEN ttfv.user_value::text
          WHEN 'select'   THEN ttfv.select_reference_value_uuid::text
          WHEN 'status'   THEN ttfv.status_reference_value_uuid::text
          WHEN 'currency' THEN ttfv.currency_value::text
        END,
        ''
      ),
      ' '
    )
  ) as search_vector,
  -- Pre-computed sortable columns for common fields (case-insensitive text)
  MAX(CASE WHEN LOWER(tf.name) = 'subject' THEN LOWER(ttfv.text_value) END) as subject_sort,
  MAX(CASE WHEN LOWER(tf.name) = 'description' THEN LOWER(ttfv.text_value) END) as description_sort,
  MAX(CASE WHEN LOWER(tf.name) = 'case number' THEN ttfv.number_value END) as case_number_sort,
  MAX(CASE WHEN LOWER(tf.name) = 'contract value' THEN (ttfv.currency_value->>'amount')::numeric END) as contract_value_sort,
  MAX(CASE WHEN LOWER(tf.name) = 'due date' THEN ttfv.date_value END) as due_date_sort,
  BOOL_OR(CASE WHEN LOWER(tf.name) = 'urgent' THEN ttfv.boolean_value END) as urgent_sort,
  -- For status, use the label for sorting
  MAX(CASE WHEN LOWER(tf.name) = 'status' THEN tfso.label END) as status_sort,
  -- For priority select field, use the label for sorting  
  MAX(CASE WHEN LOWER(tf.name) = 'priority' THEN tfo.label END) as priority_sort,
  -- For user fields, use the display name for sorting
  MAX(CASE WHEN LOWER(tf.name) = 'assigned to' THEN LOWER(u.first_name || ' ' || u.last_name) END) as assigned_to_sort
FROM ticketing_ticket tt
LEFT JOIN ticketing_ticket_field_value ttfv ON ttfv.ticket_id = tt.id
LEFT JOIN ticketing_fields tf ON tf.id = ttfv.ticket_field_id
LEFT JOIN ticketing_field_status_options tfso ON tfso.id = ttfv.status_reference_value_uuid
LEFT JOIN ticketing_field_options tfo ON tfo.id = ttfv.select_reference_value_uuid
LEFT JOIN users u ON u.id = ttfv.user_value
GROUP BY tt.id, tt.board_id, tt.created_at, tt.updated_at;

-- Create indexes for fast searching and sorting
CREATE INDEX idx_ticket_search_text ON ticket_search_index USING gin(search_vector);
CREATE INDEX idx_ticket_search_created ON ticket_search_index(created_at DESC);
CREATE UNIQUE INDEX idx_ticket_search_id ON ticket_search_index(id);
-- Indexes for sortable columns
CREATE INDEX idx_ticket_search_subject ON ticket_search_index(subject_sort);
CREATE INDEX idx_ticket_search_status ON ticket_search_index(status_sort);
CREATE INDEX idx_ticket_search_priority ON ticket_search_index(priority_sort);
CREATE INDEX idx_ticket_search_due_date ON ticket_search_index(due_date_sort);
CREATE INDEX idx_ticket_search_contract_value ON ticket_search_index(contract_value_sort);
CREATE INDEX idx_ticket_search_assigned_to ON ticket_search_index(assigned_to_sort);