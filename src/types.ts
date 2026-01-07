export interface Campaign {
  id: string;
  name: string;
  campaignId: string;
  advertiser?: string;
  alerts: Alert[];
  budget: number;
  unspentBudget: number;
  pacingRatio: number;
  roas: number;
  status?: 'active' | 'paused';
}

export interface FiltersState {
  searchQuery: string;
  dateRange: string;
  advertiser: string | string[];
  viewBy: string;
  activeTab: TabFilter;
}

export interface Alert {
  type: 'ad-groups' | 'ends-soon' | 'high-roas' | 'budget-recommendation' | 'great-pacing';
  text: string;
  color: 'red' | 'orange' | 'green';
}

export type TabFilter = 'all' | 'underpacing' | 'underperforming' | 'all-proctor-gamble';

export interface SavedView {
  id: string;
  name: string;
  filters: FiltersState;
  isDefault: boolean;
  createdAt: string; // ISO string for localStorage serialization
  isCustom: boolean; // true for user-created views, false for static tabs
}

export interface ViewTab {
  id: string;
  name: string;
  count?: number;
  isCustom: boolean;
  isDefault?: boolean;
  filters?: FiltersState;
}
