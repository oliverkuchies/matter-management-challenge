import pool from '../db/pool.js';
import { PoolClient } from 'pg';

export interface WrappedPoolClient extends PoolClient {
  isWrappedInRelease: boolean;
}

/** Added by Oliver Kucharzewski for cleanliness & connection management
 * According to SOLID principles, we should not depend on concrete implementations.
 * Thus, this base Repository class abstracts the database connection logic.
 * Other repository classes can extend this class to inherit the connection method.
 */
export class Repository {
  /**
   * Get a database client from the pool
   * Wraps the client to track if it's managed properly
   * @returns
   */
  protected async getClient() : Promise<WrappedPoolClient> {
    const client = await pool.connect() as WrappedPoolClient;
    client.isWrappedInRelease = false;
    return client;
  }

  /**
   * Release the database client back to the pool
   * @param client 
   */
  private releaseClient(client: WrappedPoolClient): void {
    client.release();
  }

  /**
   * Execute a database operation within a transaction
   * This already existed but extracted here for reuse
   * @param operation 
   * @param onError 
   * @returns
   */
  protected async executeTransaction<T>(operation: (client: WrappedPoolClient) => Promise<T>, onError?: (error: unknown) => void): Promise<T> {
    const client = await this.getClient();
    client.isWrappedInRelease = true;
    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      this.releaseClient(client);
    }
  }
  
  /**
   * Execute a database operation and release the client afterwards
   * @param operation 
   * @returns
   */
  protected async executeAndRelease<T>(operation: (client: WrappedPoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    client.isWrappedInRelease = true;
    try {
      return await operation(client);
    } finally {
      this.releaseClient(client);
    }
  }

  /**
   * This method executes a query and returns the rows.
   * Recommended to be used within executeAndRelease or executeTransaction to ensure client is managed properly.
   * @param client 
   * @param queryText 
   * @param params 
   * @returns 
   */
  protected async queryRows<T>(client: WrappedPoolClient, queryText: string, params: unknown[] = []): Promise<T[]> {
    if (!client.isWrappedInRelease) {
      throw new Error('queryRows should be called within executeAndRelease or executeTransaction to ensure proper client management.');
    }
    
    const result = await client.query(queryText, params);
    return result.rows as T[];
  }
}