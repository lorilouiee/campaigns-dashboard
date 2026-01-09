import { Campaign } from '../types';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: "2024 - Beekeeper's - Sponsored Product",
    campaignId: '02940214',
    advertiser: 'Proctor & Gamble',
    alerts: [
      { type: 'ad-groups', text: 'Ad groups (2+)', color: 'red' },
    ],
    budget: 1234567,
    unspentBudget: 1234567,
    pacingRatio: 30,
    roas: 4,
  },
  {
    id: '2',
    name: "2024 - Summer Collection - Display Ads",
    campaignId: '02940215',
    advertiser: 'Proctor & Gamble',
    alerts: [
      { type: 'high-roas', text: 'High ROAS goal', color: 'red' },
    ],
    budget: 2345678,
    unspentBudget: 1500000,
    pacingRatio: 50,
    roas: 4.5,
  },
  {
    id: '3',
    name: "2024 - Air Max Pro - Video Campaign",
    campaignId: '02940216',
    advertiser: 'Nike',
    alerts: [
      { type: 'budget-recommendation', text: 'Budget recom.', color: 'orange' },
    ],
    budget: 3456789,
    unspentBudget: 500000,
    pacingRatio: 100,
    roas: 3.8,
  },
  {
    id: '4',
    name: "2024 - Premium Skincare - Sponsored Brand",
    campaignId: '02940217',
    advertiser: 'Proctor & Gamble',
    alerts: [
      { type: 'great-pacing', text: 'Great pacing', color: 'green' },
    ],
    budget: 1876543,
    unspentBudget: 200000,
    pacingRatio: 100,
    roas: 5.2,
  },
  {
    id: '5',
    name: "2024 - Classic Refresh - Sponsored Product",
    campaignId: '02940218',
    advertiser: 'Coca-Cola',
    alerts: [
      { type: 'great-pacing', text: 'Great pacing', color: 'green' },
    ],
    budget: 2987654,
    unspentBudget: 800000,
    pacingRatio: 100,
    roas: 4.7,
  },
];

export const getUniqueAdvertisers = (campaigns: Campaign[]): string[] => {
  const advertisers = campaigns
    .map((c) => c.advertiser)
    .filter((a): a is string => a !== undefined);
  return ['All', ...Array.from(new Set(advertisers))];
};
