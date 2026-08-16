import { apiClient } from './api';
import {
  ForgeLabOverviewResponse,
  ExperimentDetailResponse,
  ExperimentItem,
} from '@/types/experiment';

export const experimentService = {
  async getOverview(): Promise<ForgeLabOverviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: ForgeLabOverviewResponse }>(
      '/forge-lab/overview'
    );
    return res.data.data;
  },

  async getExperimentDetail(id: string): Promise<ExperimentDetailResponse> {
    const res = await apiClient.get<{ success: boolean; data: ExperimentDetailResponse }>(
      `/forge-lab/experiments/${id}`
    );
    return res.data.data;
  },

  async createExperiment(data: any): Promise<ExperimentItem> {
    const res = await apiClient.post<{ success: boolean; data: ExperimentItem }>(
      '/forge-lab/experiments',
      data
    );
    return res.data.data;
  },

  async updateStatus(id: string, status: string): Promise<ExperimentItem> {
    const res = await apiClient.patch<{ success: boolean; data: ExperimentItem }>(
      `/forge-lab/experiments/${id}/status`,
      { status }
    );
    return res.data.data;
  },

  async applyResult(id: string): Promise<ExperimentItem> {
    const res = await apiClient.post<{ success: boolean; data: ExperimentItem }>(
      `/forge-lab/experiments/${id}/apply`
    );
    return res.data.data;
  },
};
