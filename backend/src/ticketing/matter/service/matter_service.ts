import { MatterRepo } from '../repo/matter_repo.js';
import { CycleTimeService } from './cycle_time_service.js';
import { sortMatters } from './sort-utils.js';
import { MatterListParams, MatterListResponse, StatusValue, CurrencyValue, UserValue, TransformedMatter } from '../../types/types.js';

export class MatterService {
  private matterRepo: MatterRepo;
  private cycleTimeService: CycleTimeService;

  constructor() {
    this.matterRepo = new MatterRepo();
    this.cycleTimeService = new CycleTimeService();
  }

  async getMatters(params: MatterListParams): Promise<MatterListResponse> {
    const { page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'asc' } = params;
    const { matters, total } = await this.matterRepo.getMatters(params);
    
    // Calculate cycle time and SLA for each matter
    let enrichedMatters : TransformedMatter[] = await Promise.all(
      matters.map(async (matter) => {
        const { cycleTime, sla } = await this.cycleTimeService.calculateCycleTimeAndSLA(
          matter.id
        );

        return {
          ...matter,
          cycleTime,
          sla,
        };
      }),
    );

    enrichedMatters = sortMatters(enrichedMatters, sortBy, sortOrder);
    const totalPages = Math.ceil(total / limit);

    return {
      data: enrichedMatters,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStatusOptions() {
      return this.matterRepo.getAllStatuses();
  }   

  async getMatterById(matterId: string): Promise<TransformedMatter | null> {
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

