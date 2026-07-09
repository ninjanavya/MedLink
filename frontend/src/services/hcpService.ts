import api from './api';
import { MockHCP, MOCK_HCPS } from '../utils/mockData';

// Local list for local browser fallback database
let localHCPs: MockHCP[] = [...MOCK_HCPS];

export const hcpService = {
  getHCPs: async (): Promise<MockHCP[]> => {
    try {
      const response = await api.get('/hcps');
      // Update local cache
      localHCPs = response.data;
      return response.data;
    } catch (e) {
      console.warn('Falling back to local mock HCPs database');
      return localHCPs;
    }
  },

  createHCP: async (hcp: Omit<MockHCP, 'id'>): Promise<MockHCP> => {
    try {
      const response = await api.post('/hcps', hcp);
      return response.data;
    } catch (e) {
      console.warn('Saving HCP to local mock database');
      const newId = localHCPs.length > 0 ? Math.max(...localHCPs.map(h => h.id)) + 1 : 1;
      const newRecord: MockHCP = {
        ...hcp,
        id: newId
      };
      localHCPs.push(newRecord);
      return newRecord;
    }
  },

  updateHCP: async (id: number, hcp: Partial<MockHCP>): Promise<MockHCP> => {
    try {
      const response = await api.put(`/hcps/${id}`, hcp);
      return response.data;
    } catch (e) {
      console.warn(`Updating local mock HCP index ID ${id}`);
      const index = localHCPs.findIndex(h => h.id === id);
      if (index === -1) throw new Error('HCP not found locally');
      localHCPs[index] = {
        ...localHCPs[index],
        ...hcp
      };
      return localHCPs[index];
    }
  },

  deleteHCP: async (id: number): Promise<void> => {
    try {
      await api.delete(`/hcps/${id}`);
    } catch (e) {
      console.warn(`Deleting local mock HCP index ID ${id}`);
      localHCPs = localHCPs.filter(h => h.id !== id);
    }
  }
};
export default hcpService;
