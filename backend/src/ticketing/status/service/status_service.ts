import { StatusRepo } from "../repo/status_repo.js";

export class StatusService {
    protected statusRepo: StatusRepo;

    constructor() {
        this.statusRepo = new StatusRepo();
    }

    async getStatusOptions() {
        return this.statusRepo.getAllStatuses();
    }   
}