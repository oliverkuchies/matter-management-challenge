import { Repository } from "../../../repository/repository.js";
import { StatusFieldValue } from "../../types.js";

export class StatusRepo extends Repository {
    /**
     * Get all statuses such as To Do, In Progress, Done
     */
    async getAllStatuses(): Promise<StatusFieldValue[]> {
      return this.executeAndRelease(async (client) => {
        const rows = await this.queryRows<{ id: string; label: string; sequence: number }>(
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
     * Update status by matter id
     */

}
