import { MatterRepo } from '../repo/matter_repo.js';
import { CycleTimeService } from './cycle_time_service.js';
import { sortMatters } from './sort-utils.js';
import { MatterListParams, MatterListResponse, StatusValue, CurrencyValue, UserValue, Matter, Matter } from '../../types/types.js';

export class MatterService {
  private matterRepo: MatterRepo;
  private cycleTimeService: CycleTimeService;
  private readonly BATCH_SIZE = 50;

  constructor() {
    this.matterRepo = new MatterRepo();
    this.cycleTimeService = new CycleTimeService();
  }

  /**
   * Determines if the query requires fetching all matters for in-memory processing
   * Returns true for SLA, resolution time, due date filtering or computed field sorting
   */
  private needsInMemoryProcessing(params: MatterListParams): boolean {
    const { sla, resolutionTime, dueDate, sortBy } = params;
    
    return (
      (sla && sla !== 'All') || 
      (resolutionTime && resolutionTime !== 'All') || 
      (dueDate && dueDate !== 'All') ||
      sortBy === 'sla' || 
      sortBy === 'resolution_time'
    );
  }

  /**
   * Fetches matters from repository, either all or paginated based on processing needs
   */
  private async fetchMatters(params: MatterListParams, needsInMemory: boolean) {
    if (needsInMemory) {
      // Fetch ALL matters to calculate SLA and filter correctly
      const result = await this.matterRepo.getMatters({
        ...params,
        page: 1,
        limit: 10000,
      });
      return result.matters;
    } else {
      // Use normal pagination from DB
      const result = await this.matterRepo.getMatters(params);
      return result.matters;
    }
  }

  /**
   * Enriches matters with cycle time and SLA data in batches
   * Batching prevents connection pool exhaustion
   */
  private async enrichMattersWithCycleTime(matters: Matter[]): Promise<Matter[]> {
    const enrichedMatters: Matter[] = [];
    
    for (let i = 0; i < matters.length; i += this.BATCH_SIZE) {
      const batch = matters.slice(i, i + this.BATCH_SIZE);
      const enrichedBatch = await Promise.all(
        batch.map(async (matter) => {
          const { cycleTime, sla } = await this.cycleTimeService.calculateCycleTimeAndSLA(
            matter.id
          );

          return {
            ...matter,
            cycleTime,
            sla,
          };
        })
      );
      enrichedMatters.push(...enrichedBatch);
    }

    return enrichedMatters;
  }

  /**
   * Filters matters by SLA status
   */
  private filterBySLA(matters: Matter[], slaFilter?: string): Matter[] {
    if (!slaFilter || slaFilter === 'All') {
      return matters;
    }
    return matters.filter(matter => matter.sla === slaFilter);
  }

  /**
   * Filters matters by resolution time bucket
   */
  private filterByResolutionTime(matters: Matter[], resolutionTimeFilter?: string): Matter[] {
    if (!resolutionTimeFilter || resolutionTimeFilter === 'All') {
      return matters;
    }

    const oneHour = 60 * 60 * 1000;

    return matters.filter(matter => {
      const timeMs = matter.cycleTime?.resolutionTimeMs;
      if (timeMs === null || timeMs === undefined) return false;
      
      switch (resolutionTimeFilter) {
        case 'Under 1 hour':
          return timeMs < oneHour;
        case '1-4 hours':
          return timeMs >= oneHour && timeMs < 4 * oneHour;
        case '4-8 hours':
          return timeMs >= 4 * oneHour && timeMs < 8 * oneHour;
        case 'Over 8 hours':
          return timeMs >= 8 * oneHour;
        default:
          return true;
      }
    });
  }

  /**
   * Filters matters by due date range
   */
  private filterByDueDate(matters: Matter[], dueDateFilter?: string): Matter[] {
    if (!dueDateFilter || dueDateFilter === 'All') {
      return matters;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const oneWeek = new Date(today);
    oneWeek.setDate(oneWeek.getDate() + 7);
    
    const oneMonth = new Date(today);
    oneMonth.setMonth(oneMonth.getMonth() + 1);

    return matters.filter(matter => {
      const dueDateField = matter.fields['due date'];
      
      if (!dueDateField || !dueDateField.value) {
        return dueDateFilter === 'No Due Date';
      }

      const dueDateValue = new Date(dueDateField.value as string);

      switch (dueDateFilter) {
        case 'Overdue':
          return dueDateValue < today;
        case 'Due Today':
          return dueDateValue >= today && dueDateValue < tomorrow;
        case 'Due This Week':
          return dueDateValue >= today && dueDateValue < oneWeek;
        case 'Due This Month':
          return dueDateValue >= today && dueDateValue < oneMonth;
        case 'No Due Date':
          return false;
        default:
          return true;
      }
    });
  }

  /**
   * Applies all filters to the matter list
   */
  private applyFilters(
    matters: Matter[],
    sla?: string,
    resolutionTime?: string,
    dueDate?: string
  ): Matter[] {
    let filtered = this.filterBySLA(matters, sla);
    filtered = this.filterByResolutionTime(filtered, resolutionTime);
    filtered = this.filterByDueDate(filtered, dueDate);
    return filtered;
  }

  /**
   * Sorts matters if needed (for computed fields)
   */
  private sortMatters(
    matters: Matter[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Matter[] {
    if (!sortBy) {
      return matters;
    }

    if (sortBy === 'sla' || sortBy === 'resolution_time') {
      return sortMatters(matters, sortBy, sortOrder);
    }

    // Otherwise, sorting was already done by the database
    return matters;
  }

  /**
   * Paginates the matter list
   */
  private paginateMatters(
    matters: Matter[],
    page: number,
    limit: number
  ): { paginatedMatters: Matter[]; total: number; totalPages: number } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatters = matters.slice(startIndex, endIndex);
    const total = matters.length;
    const totalPages = Math.ceil(total / limit);

    return { paginatedMatters, total, totalPages };
  }

  /**
   * Main entry point: Gets matters with filtering, sorting, and pagination
   */
  async getMatters(params: MatterListParams): Promise<MatterListResponse> {
    const { page = 1, limit = 25, sla, resolutionTime, dueDate, sortBy, sortOrder = 'asc' } = params;

    // Determine processing strategy
    const needsInMemory = this.needsInMemoryProcessing(params);
    
    // Fetch matters
    const matters = await this.fetchMatters(params, needsInMemory);
    
    // Enrich with cycle time and SLA
    const enrichedMatters = await this.enrichMattersWithCycleTime(matters);

    // Apply filters
    const filteredMatters = this.applyFilters(enrichedMatters, sla, resolutionTime, dueDate);

    // Sort
    const sortedMatters = this.sortMatters(filteredMatters, sortBy, sortOrder);

    // Paginate
    const { paginatedMatters, total, totalPages } = this.paginateMatters(sortedMatters, page, limit);

    return {
      data: paginatedMatters,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStatusOptions() {
      return this.matterRepo.getAllStatuses();
  }   

  async getMatterById(matterId: string): Promise<Matter | null> {
    const matter = await this.matterRepo.getMatterById(matterId);
    
    if (!matter) {
      return null;
    }

    const { cycleTime, sla } = await this.cycleTimeService.calculateCycleTimeAndSLA(
      matter.id,
    );

    return {
      ...matter,
      cycleTime,
      sla,
    };
  }

  async updateMatter(
    matterId: string,
    fieldId: string,
    fieldType: string,
    value: string | number | boolean | Date | CurrencyValue | UserValue | StatusValue | null,
    userId: number,
  ): Promise<void> {
    await this.matterRepo.updateMatterField(matterId, fieldId, fieldType, value, userId);
  }
}

export default MatterService;

