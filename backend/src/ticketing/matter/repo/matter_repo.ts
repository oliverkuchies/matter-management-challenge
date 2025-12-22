import { Matter, MatterListParams, FieldValue, UserValue, CurrencyValue, StatusValue, StatusFieldValue } from '../../types/types.js';
import logger from '../../../utils/logger.js';
import { Repository, WrappedPoolClient } from '../../../repository/repository.js';
import { CountRow, CurrentStatusRow, FieldValueRow, MatterRow, StatusOptionRow, TicketingTimeEntryRow } from './types/types.js';

export class MatterRepo extends Repository {
  async getTransitionInfo(matterId: string) {
    return this.executeAndRelease(async (client) => {
      const rows = await this.queryRows<TicketingTimeEntryRow>(
        client,
        `SELECT 
           tfsg_from.name, 
           tfsg_to.name, 
           th.id, 
           th.from_status_id as status_from, 
           th.to_status_id as status_to, 
           th.transitioned_at as changed_at,
           -- Calculate total duration in milliseconds using window function
           ROUND(EXTRACT(EPOCH FROM (
             LAST_VALUE(th.transitioned_at) OVER (ORDER BY th.transitioned_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) - 
             FIRST_VALUE(th.transitioned_at) OVER (ORDER BY th.transitioned_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
           )) * 1000) as total_duration_ms
         FROM ticketing_cycle_time_histories th 
         LEFT JOIN ticketing_field_status_options tfso_from ON th.from_status_id = tfso_from.id
         LEFT JOIN ticketing_field_status_options tfso_to ON th.to_status_id = tfso_to.id
         LEFT JOIN ticketing_field_status_groups tfsg_from ON tfso_from.group_id = tfsg_from.id
         LEFT JOIN ticketing_field_status_groups tfsg_to ON tfso_to.group_id = tfsg_to.id
         WHERE th.ticket_id = $1 
         ORDER BY th.transitioned_at ASC`,
        [matterId],
      );

      if (rows.length === 0) {
        return {
          totalDurationMs: 0,
          transitions: [],
        }
      }

      return {
        totalDurationMs: Number(rows[0].total_duration_ms),
        transitions: rows,
      }
    });
  }

  /**
   * Get all status field values
   * For example, to populate a status dropdown
   * Example values include: 
   * { displayValue: "Open", sequence: 1, statusGroupId: "status-1" }
   * { displayValue: "In Progress", sequence: 2, statusGroupId: "status-2" }
   * { displayValue: "Closed", sequence: 3, statusGroupId: "status-3" }
   */
    async getAllStatuses(): Promise<StatusFieldValue[]> {
      return this.executeAndRelease(async (client) => {
        const rows = await this.queryRows<StatusOptionRow>(
          client,
          `SELECT id, label, sequence from ticketing_field_status_options ORDER BY sequence ASC LIMIT 10`
        );

        if (rows.length === 0) {
          return [];
        }

        return rows.map((row) => ({
          displayValue: row.label,
          sequence: row.sequence,
          statusGroupId: row.id,
        }));
      });
    }

  /**
   * Get paginated list of matters with search and sorting
   * 
   * TODO: Implement search functionality
   * - Search across text, number, and other field types
   * - Use PostgreSQL pg_trgm extension for fuzzy matching
   * - Consider performance with proper indexing
   * - Support searching cycle times and SLA statuses
   * 
   * Search Requirements:
   * - Text fields: Use ILIKE with pg_trgm indexes
   * - Number fields: Convert to text for search
   * - Status fields: Search by label
   * - User fields: Search by name
   * - Consider debouncing on frontend (already implemented)
   * 
   * Performance Considerations for 10× Load:
   * - Add GIN indexes on searchable columns
   * - Consider Elasticsearch for advanced search at scale
   * - Implement query result caching
   * - Use connection pooling effectively
   */
  async getMatters(params: MatterListParams) {
    const { page = 1, limit = 25, sortBy = 'created_at', sortOrder = 'asc' } = params;
    const offset = (page - 1) * limit;

    return await this.executeAndRelease<{ matters: Matter[]; total: number }>(async (client) => {
      const searchTerm = params.search ?? '';
      const hasSearch = searchTerm.trim().length > 0;

      // Use materialized view for both count and data queries
      const queryParams: (string | number)[] = [];
      let whereClause = '';

      if (hasSearch) {
        // Use plainto_tsquery for literal text matching without operator interpretation
        // Then add ILIKE fallback for exact substring matches (handles symbols and partial matches)
        whereClause = `WHERE (
          search_vector @@ plainto_tsquery('english', $1)
          OR searchable_text ILIKE '%' || $1 || '%'
        )`;
        queryParams.push(searchTerm);
      }

      // Get total count from materialized view
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ticket_search_index
        ${whereClause}
      `;
      
      const countRows = await this.queryRows<CountRow>(client, countQuery, queryParams);
      const total = parseInt(countRows[0].total);

      // Map sortBy field names to materialized view columns
      // This handles the mapping from frontend field names to database column names
      const sortColumnMap: Record<string, string> = {
        'subject': 'subject_sort',
        'description': 'description_sort',
        'case number': 'case_number_sort',
        'casenumber': 'case_number_sort',
        'contract value': 'contract_value_sort',
        'contractvalue': 'contract_value_sort',
        'due date': 'due_date_sort',
        'duedate': 'due_date_sort',
        'urgent': 'urgent_sort',
        'status': 'status_sort',
        'priority': 'priority_sort',
        'assigned to': 'assigned_to_sort',
        'assignedto': 'assigned_to_sort',
        'created_at': 'created_at',
        'createdat': 'created_at',
        'updated_at': 'updated_at',
        'updatedat': 'updated_at',
      };

      // Build ORDER BY clause using materialized view sort columns
      const sortByLower = sortBy.toLowerCase();
      const sortColumn = sortColumnMap[sortByLower] || 'created_at';
      const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      
      // NULLS LAST ensures null values are sorted to the end regardless of sort direction
      const orderByClause = `ORDER BY ${sortColumn} ${sortDirection} NULLS LAST, created_at DESC`;

      // Get matters from materialized view with sorting
      const limitParamIndex = queryParams.length + 1;
      const offsetParamIndex = queryParams.length + 2;

      const mattersQuery = `
        SELECT 
          id,
          board_id,
          created_at,
          updated_at
        FROM ticket_search_index
        ${whereClause}
        ${orderByClause}
        LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
      `;
      
      queryParams.push(limit, offset);
      
      const mattersRows = await this.queryRows<MatterRow>(client, mattersQuery, queryParams);

      // Get all fields for these matters in a single query
      const matters: Matter[] = [];
      
      if (mattersRows.length === 0) {
        return { matters, total };
      }

      const matterIds = mattersRows.map(row => row.id);
      const fieldsByMatterId = await this.getMatterFieldsBulk(client, matterIds);

      // Construct matters array with fields
      for (const matterRow of mattersRows) {
        matters.push({
          id: matterRow.id,
          boardId: matterRow.board_id,
          fields: fieldsByMatterId.get(matterRow.id) || {},
          createdAt: matterRow.created_at,
          updatedAt: matterRow.updated_at,
        });
      }

      return { matters, total };
    });
  }

  /**
   * Get a single matter by ID
   */
  async getMatterById(matterId: string): Promise<Matter | null> {
    return this.executeAndRelease<Matter | null>(async (client) => {
      const matterRows = await this.queryRows<MatterRow>(
        client,
        `SELECT id, board_id, created_at, updated_at
         FROM ticketing_ticket
         WHERE id = $1`,
        [matterId],
      );

      if (matterRows.length === 0) {
        return null;
      }

      const matterRow = matterRows[0];
      const fields = await this.getMatterFields(client, matterId);

      return {
        id: matterRow.id,
        boardId: matterRow.board_id,
        fields,
        createdAt: matterRow.created_at,
        updatedAt: matterRow.updated_at,
      };
    });
  }

  /**
   * Get all field values for multiple matters in a single query
   */
  private async getMatterFieldsBulk(client: WrappedPoolClient, matterIds: string[]): Promise<Map<string, Record<string, FieldValue>>> {
    const allFieldsRows = await this.queryRows<FieldValueRow & { ticket_id: string }>(
      client,
      `SELECT 
        ttfv.ticket_id,
        ttfv.id,
        ttfv.ticket_field_id,
        tf.name as field_name,
        tf.field_type,
        ttfv.text_value,
        ttfv.string_value,
        ttfv.number_value,
        ttfv.date_value,
        ttfv.boolean_value,
        ttfv.currency_value,
        ttfv.user_value,
        ttfv.select_reference_value_uuid,
        ttfv.status_reference_value_uuid,
        -- User data
        u.id as user_id,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        -- Select option label
        tfo.label as select_option_label,
        -- Status option data
        tfso.label as status_option_label,
        tfsg.name as status_group_name
       FROM ticketing_ticket_field_value ttfv
       JOIN ticketing_fields tf ON ttfv.ticket_field_id = tf.id
       LEFT JOIN users u ON ttfv.user_value = u.id
       LEFT JOIN ticketing_field_options tfo ON ttfv.select_reference_value_uuid = tfo.id
       LEFT JOIN ticketing_field_status_options tfso ON ttfv.status_reference_value_uuid = tfso.id
       LEFT JOIN ticketing_field_status_groups tfsg ON tfso.group_id = tfsg.id
       WHERE ttfv.ticket_id = ANY($1)`,
      [matterIds],
    );

    // Group fields by matter ID
    const fieldsByMatterId = new Map<string, Record<string, FieldValue>>();
    
    for (const row of allFieldsRows) {
      if (!fieldsByMatterId.has(row.ticket_id)) {
        fieldsByMatterId.set(row.ticket_id, {});
      }
      
      const fields = fieldsByMatterId.get(row.ticket_id)!;
      const { value, displayValue } = this.parseFieldValue(row);

      // Making them all lowercase for easier sorting.. before it was kinda mixed
      fields[row.field_name.toLowerCase()] = {
        fieldId: row.ticket_field_id,
        fieldName: row.field_name,
        fieldType: row.field_type,
        value,
        displayValue,
      };
    }

    return fieldsByMatterId;
  }

  /**
   * Parse field value based on field type
   */
  private parseFieldValue(row: FieldValueRow) {
    let value: string | number | boolean | Date | CurrencyValue | UserValue | StatusValue | null = null;
    let displayValue: string | null = null;

    switch (row.field_type) {
      case 'text':
        value = row.text_value || row.string_value;
        break;
      case 'number':
        value = row.number_value ? parseFloat(row.number_value) : null;
        displayValue = value !== null ? value.toLocaleString() : null;
        break;
      case 'date':
        value = row.date_value;
        displayValue = row.date_value ? new Date(row.date_value).toLocaleDateString() : null;
        break;
      case 'boolean':
        value = row.boolean_value;
        displayValue = value ? '✓' : '✗';
        break;
      case 'currency':
        value = row.currency_value;
        if (row.currency_value) {
          displayValue = `${row.currency_value.amount.toLocaleString()} ${(row.currency_value as CurrencyValue).currency}`;
        }
        break;
      case 'user':
        if (row.user_id) {
          const userValue: UserValue = {
            id: row.user_id,
            email: row.user_email,
            firstName: row.user_first_name,
            lastName: row.user_last_name,
            displayName: `${row.user_first_name} ${row.user_last_name}`.trim(),
          };
          value = userValue;
          displayValue = userValue.displayName;
        }
        break;
      case 'select':
        value = row.select_reference_value_uuid;
        displayValue = row.select_option_label;
        break;
      case 'status':
        value = row.status_reference_value_uuid;
        displayValue = row.status_option_label;
        if (row.status_group_name) {
          value = {
            statusId: row.status_reference_value_uuid!,
            groupName: row.status_group_name,
          }
        }
        break;
    }

    return { value, displayValue };
  }

  /**
   * Get all field values for a matter
   */
  private async getMatterFields(client: WrappedPoolClient, ticketId: string): Promise<Record<string, FieldValue>> {
    const fieldsRows = await this.queryRows<FieldValueRow>(
      client,
      `SELECT 
        ttfv.id,
        ttfv.ticket_field_id,
        tf.name as field_name,
        tf.field_type,
        ttfv.text_value,
        ttfv.string_value,
        ttfv.number_value,
        ttfv.date_value,
        ttfv.boolean_value,
        ttfv.currency_value,
        ttfv.user_value,
        ttfv.select_reference_value_uuid,
        ttfv.status_reference_value_uuid,
        -- User data
        u.id as user_id,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        -- Select option label
        tfo.label as select_option_label,
        -- Status option data
        tfso.label as status_option_label,
        tfsg.name as status_group_name
       FROM ticketing_ticket_field_value ttfv
       JOIN ticketing_fields tf ON ttfv.ticket_field_id = tf.id
       LEFT JOIN users u ON ttfv.user_value = u.id
       LEFT JOIN ticketing_field_options tfo ON ttfv.select_reference_value_uuid = tfo.id
       LEFT JOIN ticketing_field_status_options tfso ON ttfv.status_reference_value_uuid = tfso.id
       LEFT JOIN ticketing_field_status_groups tfsg ON tfso.group_id = tfsg.id
       WHERE ttfv.ticket_id = $1`,
      [ticketId],
    );

    const fields: Record<string, FieldValue> = {};

    for (const row of fieldsRows) {
      const { value, displayValue } = this.parseFieldValue(row);

      fields[row.field_name] = {
        fieldId: row.ticket_field_id,
        fieldName: row.field_name,
        fieldType: row.field_type,
        value,
        displayValue,
      };
    }

    return fields;
  }

  /**
   * Update a matter's field value
   */
  async updateMatterField(
    matterId: string,
    fieldId: string,
    fieldType: string,
    value: string | number | boolean | Date | CurrencyValue | UserValue | StatusValue | null,
    userId: number,
  ): Promise<void> {
    await this.executeTransaction<void>(async (client) => {

      // Determine which column to update based on field type
      let columnName: string;
      let columnValue: string | number | boolean | Date | null = null;

      switch (fieldType) {
        case 'text':
          columnName = 'text_value';
          columnValue = value as string;
          break;
        case 'number':
          columnName = 'number_value';
          columnValue = value as number;
          break;
        case 'date':
          columnName = 'date_value';
          columnValue = value as Date;
          break;
        case 'boolean':
          columnName = 'boolean_value';
          columnValue = value as boolean;
          break;
        case 'currency':
          columnName = 'currency_value';
          columnValue = JSON.stringify(value);
          break;
        case 'user':
          columnName = 'user_value';
          columnValue = value as number;
          break;
        case 'select':
          columnName = 'select_reference_value_uuid';
          columnValue = value as string;
          break;
        case 'status': {
          columnName = 'status_reference_value_uuid';
          columnValue = value as string;
          
          // Track status change in cycle time history
          const currentStatusRows = await this.queryRows<CurrentStatusRow>(
            client,
            `SELECT status_reference_value_uuid 
             FROM ticketing_ticket_field_value 
             WHERE ticket_id = $1 AND ticket_field_id = $2`,
            [matterId, fieldId],
          );
          
          if (currentStatusRows.length > 0) {
            const fromStatusId = currentStatusRows[0].status_reference_value_uuid;
            
            await client.query(
              `INSERT INTO ticketing_cycle_time_histories 
               (ticket_id, status_field_id, from_status_id, to_status_id, transitioned_at)
               VALUES ($1, $2, $3, $4, NOW())`,
              [matterId, fieldId, fromStatusId, value],
            );
          }
          break;
        }
        default:
          throw new Error(`Unsupported field type: ${fieldType}`);
      }

      // Upsert field value
      await client.query(
        `INSERT INTO ticketing_ticket_field_value 
         (ticket_id, ticket_field_id, ${columnName}, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (ticket_id, ticket_field_id)
         DO UPDATE SET ${columnName} = $3, updated_by = $5, updated_at = NOW()`,
        [matterId, fieldId, columnValue, userId, userId],
      );

      // Update matter's updated_at
      await client.query(
        `UPDATE ticketing_ticket SET updated_at = NOW() WHERE id = $1`,
        [matterId],
      );

      await this.refreshSingleMatterSearchIndex(client, matterId);
    }, (error) => {
      logger.error('Failed to update matter field' + JSON.stringify({ error, matterId, fieldId }));
    });
  }

  /**
   * Refresh search index for a single matter
   */
  private async refreshSingleMatterSearchIndex(client: WrappedPoolClient, matterId: string): Promise<void> {
    // Delete stale entry
    await client.query(
      `DELETE FROM ticket_search_index WHERE id = $1`,
      [matterId]
    );

    // Re-insert updated entry
    // This query is already used in schema.sql, but adapted here for single matter
    await client.query(
      `INSERT INTO ticket_search_index (id, board_id, created_at, updated_at, searchable_text, search_vector)
       SELECT 
         tt.id,
         tt.board_id,
         tt.created_at,
         tt.updated_at,
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
         ) as search_vector
       FROM ticketing_ticket tt
       LEFT JOIN ticketing_ticket_field_value ttfv ON ttfv.ticket_id = tt.id
       LEFT JOIN ticketing_fields tf ON tf.id = ttfv.ticket_field_id
       WHERE tt.id = $1
       GROUP BY tt.id, tt.board_id, tt.created_at, tt.updated_at`,
      [matterId]
    );
  }
}

export default MatterRepo;

