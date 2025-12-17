import { Repository } from '../../../repository/repository.js';
import { Field, StatusGroup } from '../../types/types.js';
import { CurrencyOptionRow, FieldOptionRow, FieldRow, StatusGroupRow, StatusOptionRow } from './types/field_types.js';

export class FieldsRepo extends Repository {
  async getAllFields(accountId: number): Promise<Field[]> {
    return this.executeAndRelease(async (client) => {
      const fieldsRows = await this.queryRows<FieldRow>(
        client,
        `SELECT id, account_id, name, field_type, description, metadata, system_field
         FROM ticketing_fields
         WHERE account_id = $1 AND deleted_at IS NULL
         ORDER BY name`,
        [accountId],
      );

      const fields: Field[] = [];

      for (const row of fieldsRows) {
        const field: Field = {
          id: row.id,
          accountId: row.account_id,
          name: row.name,
          fieldType: row.field_type,
          description: row.description,
          metadata: row.metadata,
          systemField: row.system_field,
        };

        // Fetch options for select fields
        if (row.field_type === 'select') {
          const optionsRows = await this.queryRows<FieldOptionRow>(
            client,
            `SELECT id, label, sequence
             FROM ticketing_field_options
             WHERE ticket_field_id = $1 AND deleted_at IS NULL
             ORDER BY sequence`,
            [row.id],
          );
          field.options = optionsRows.map((opt) => ({
            id: opt.id,
            label: opt.label,
            sequence: opt.sequence,
          }));
        }

        // Fetch status options for status fields
        if (row.field_type === 'status') {
          const statusRows = await this.queryRows<StatusOptionRow>(
            client,
            `SELECT tfso.id, tfso.label, tfso.group_id, tfsg.name as group_name, tfso.sequence
             FROM ticketing_field_status_options tfso
             JOIN ticketing_field_status_groups tfsg ON tfso.group_id = tfsg.id
             WHERE tfso.ticket_field_id = $1 AND tfso.deleted_at IS NULL
             ORDER BY tfso.sequence`,
            [row.id],
          );
          field.statusOptions = statusRows.map((opt) => ({
            id: opt.id,
            label: opt.label,
            groupId: opt.group_id,
            groupName: opt.group_name,
            sequence: opt.sequence,
          }));
        }

        fields.push(field);
      }

      return fields;
    });
  }

  async getStatusGroups(accountId: number): Promise<StatusGroup[]> {
    return this.executeAndRelease(async (client) => {
      const rows = await this.queryRows<StatusGroupRow>(
        client,
        `SELECT id, name, sequence
         FROM ticketing_field_status_groups
         WHERE account_id = $1 AND deleted_at IS NULL
         ORDER BY sequence`,
        [accountId],
      );

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        sequence: row.sequence,
      }));
    });
  }

  async getCurrencyOptions(accountId: number) {
    return this.executeAndRelease(async (client) => {
      const rows = await this.queryRows<CurrencyOptionRow>(
        client,
        `SELECT id, code, name, symbol, sequence
         FROM ticketing_currency_field_options
         WHERE account_id = $1 AND deleted_at IS NULL
         ORDER BY sequence`,
        [accountId],
      );

      return rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        symbol: row.symbol,
        sequence: row.sequence,
      }));
    });
  }
}

export default FieldsRepo;