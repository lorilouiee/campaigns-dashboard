import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import * as Popover from '@radix-ui/react-popover';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface GraphViewProps {
  isVisible: boolean;
  compareEnabled?: boolean;
  dateRange?: string;
}

// Define all available metrics
type MetricKey = 'revenue' | 'impressions' | 'clicks' | 'ctr' | 'cpc' | 'spend' | 'conversions' | 'roas';

interface MetricDefinition {
  key: MetricKey;
  label: string;
  color: string;
  yAxisId: 'left' | 'right' | 'ctr';
  formatter: (value: number) => string;
}

const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  revenue: {
    key: 'revenue',
    label: 'Revenue',
    color: '#3B82F6', // Blue
    yAxisId: 'left',
    formatter: (v) => {
      const abs = Math.abs(v);
      if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
      return `$${v.toFixed(0)}`;
    },
  },
  impressions: {
    key: 'impressions',
    label: 'Impressions',
    color: '#A855F7', // Purple
    yAxisId: 'right',
    formatter: (v) => {
      const abs = Math.abs(v);
      if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
      return `${v}`;
    },
  },
  clicks: {
    key: 'clicks',
    label: 'Clicks',
    color: '#1E3A8A', // Navy
    yAxisId: 'right',
    formatter: (v) => {
      const abs = Math.abs(v);
      if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
      return `${v}`;
    },
  },
  ctr: {
    key: 'ctr',
    label: 'CTR',
    color: '#60A5FA', // Sky Blue
    yAxisId: 'ctr',
    formatter: (v) => `${v.toFixed(1)}%`,
  },
  cpc: {
    key: 'cpc',
    label: 'CPC',
    color: '#10B981', // Green
    yAxisId: 'left',
    formatter: (v) => `$${v.toFixed(2)}`,
  },
  spend: {
    key: 'spend',
    label: 'Spend',
    color: '#F59E0B', // Amber
    yAxisId: 'left',
    formatter: (v) => {
      const abs = Math.abs(v);
      if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
      return `$${v.toFixed(0)}`;
    },
  },
  conversions: {
    key: 'conversions',
    label: 'Conversions',
    color: '#EC4899', // Pink
    yAxisId: 'right',
    formatter: (v) => {
      const abs = Math.abs(v);
      if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
      return `${v}`;
    },
  },
  roas: {
    key: 'roas',
    label: 'ROAS',
    color: '#8B5CF6', // Violet
    yAxisId: 'ctr',
    formatter: (v) => `${v.toFixed(2)}x`,
  },
};

const GraphView = ({ isVisible, compareEnabled = false }: GraphViewProps) => {
  if (!isVisible) return null;

  // Mock data with all metrics
  const data = useMemo(
    () => [
      { date: '5/1', revenue: 18_200_000, impressions: 92_100_000, clicks: 3_210_000, ctr: 4.1, cpc: 5.67, spend: 14_500_000, conversions: 12_400, roas: 3.2 },
      { date: '5/2', revenue: 15_600_000, impressions: 88_400_000, clicks: 3_080_000, ctr: 4.3, cpc: 5.21, spend: 13_200_000, conversions: 11_800, roas: 3.5 },
      { date: '5/3', revenue: 21_400_000, impressions: 104_700_000, clicks: 3_560_000, ctr: 4.6, cpc: 6.01, spend: 16_800_000, conversions: 14_200, roas: 3.8 },
      { date: '5/4', revenue: 24_900_000, impressions: 118_200_000, clicks: 3_990_000, ctr: 4.9, cpc: 6.24, spend: 18_900_000, conversions: 15_600, roas: 4.1 },
      { date: '5/5', revenue: 20_800_000, impressions: 112_600_000, clicks: 3_740_000, ctr: 4.7, cpc: 5.56, spend: 17_200_000, conversions: 13_900, roas: 3.9 },
      { date: '5/6', revenue: 26_100_000, impressions: 126_800_000, clicks: 4_220_000, ctr: 5.1, cpc: 6.18, spend: 19_800_000, conversions: 16_400, roas: 4.3 },
      { date: '5/7', revenue: 22_700_000, impressions: 120_500_000, clicks: 4_040_000, ctr: 5.0, cpc: 5.62, spend: 18_100_000, conversions: 15_100, roas: 4.0 },
    ],
    []
  );

  // Generate comparison data (shifted back by the same duration) and merge with main data
  const chartData = useMemo(() => {
    if (!compareEnabled) return data;
    
    // For simplicity, we'll shift the data back by 7 days (assuming 7-day range)
    // In a real app, you'd calculate this based on the actual dateRange
    return data.map((item, index) => {
      const comparisonIndex = Math.max(0, index - 7);
      const comparisonItem = data[comparisonIndex];
      return {
        ...item,
        // Add comparison metrics with a suffix
        revenueCompare: comparisonItem.revenue * 0.85, // Slightly lower for visual distinction
        impressionsCompare: comparisonItem.impressions * 0.85,
        clicksCompare: comparisonItem.clicks * 0.85,
        ctrCompare: comparisonItem.ctr * 0.95,
        cpcCompare: comparisonItem.cpc * 1.05,
        spendCompare: comparisonItem.spend * 0.85,
        conversionsCompare: comparisonItem.conversions * 0.85,
        roasCompare: comparisonItem.roas * 0.95,
      };
    });
  }, [compareEnabled, data]);

  // Separate comparison data for stats calculation
  const comparisonData = useMemo(() => {
    if (!compareEnabled) return null;
    
    return data.map((item, index) => {
      const comparisonIndex = Math.max(0, index - 7);
      const comparisonItem = data[comparisonIndex];
      return {
        date: item.date,
        revenue: comparisonItem.revenue * 0.85,
        impressions: comparisonItem.impressions * 0.85,
        clicks: comparisonItem.clicks * 0.85,
        ctr: comparisonItem.ctr * 0.95,
        cpc: comparisonItem.cpc * 1.05,
        spend: comparisonItem.spend * 0.85,
        conversions: comparisonItem.conversions * 0.85,
        roas: comparisonItem.roas * 0.95,
      };
    });
  }, [compareEnabled, data]);

  // State: each card slot can have a selected metric or null
  const [selectedMetrics, setSelectedMetrics] = useState<(MetricKey | null)[]>([
    'revenue',
    'impressions',
    'clicks',
    'ctr',
  ]);

  // State: track which cards are active (showing line and border)
  const [activeCards, setActiveCards] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  
  // State: track which metric dot is currently being hovered
  const [hoveredMetric, setHoveredMetric] = useState<MetricKey | null>(null);

  // Calculate totals and trends for each metric
  const metricStats = useMemo(() => {
    const stats: Record<MetricKey, { total: number; trend: number; comparisonTotal?: number; delta?: number }> = {} as any;
    
    Object.keys(METRIC_DEFINITIONS).forEach((key) => {
      const metricKey = key as MetricKey;
      const values = data.map((d) => d[metricKey]);
      const total = values.reduce((sum, v) => sum + v, 0);
      const avg = metricKey === 'ctr' || metricKey === 'roas' ? total / values.length : total;
      
      // Calculate comparison total if comparison is enabled
      let comparisonTotal: number | undefined;
      let delta: number | undefined;
      
      if (compareEnabled && comparisonData) {
        const comparisonValues = comparisonData.map((d) => d[metricKey]);
        const comparisonSum = comparisonValues.reduce((sum, v) => sum + v, 0);
        comparisonTotal = metricKey === 'ctr' || metricKey === 'roas' ? comparisonSum / comparisonValues.length : comparisonSum;
        
        // Calculate delta percentage
        if (comparisonTotal > 0) {
          delta = ((avg - comparisonTotal) / comparisonTotal) * 100;
        } else if (avg > 0) {
          delta = 100;
        } else {
          delta = 0;
        }
      } else {
        // Calculate trend (compare last 3 days vs first 3 days) when comparison is not enabled
        const firstHalf = values.slice(0, 3).reduce((sum, v) => sum + v, 0) / 3;
        const secondHalf = values.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
        delta = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
      }
      
      stats[metricKey] = {
        total: metricKey === 'ctr' || metricKey === 'roas' ? avg : total,
        trend: delta || 0,
        comparisonTotal,
        delta,
      };
    });
    
    return stats;
  }, [data, compareEnabled, comparisonData]);

  const handleMetricSelect = (cardIndex: number, metricKey: MetricKey) => {
    setSelectedMetrics((prev) => {
      const next = [...prev];
      next[cardIndex] = metricKey;
      return next;
    });
    // Auto-activate when selecting a new metric
    setActiveCards((prev) => {
      const next = new Set(prev);
      next.add(cardIndex);
      return next;
    });
  };

  const handleRemoveCard = (cardIndex: number) => {
    setSelectedMetrics((prev) => {
      const next = [...prev];
      next[cardIndex] = null;
      return next;
    });
    // Remove from active cards when card is removed
    setActiveCards((prev) => {
      const next = new Set(prev);
      next.delete(cardIndex);
      return next;
    });
  };

  const handleCardToggle = (cardIndex: number) => {
    setActiveCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardIndex)) {
        next.delete(cardIndex);
      } else {
        next.add(cardIndex);
      }
      return next;
    });
  };

  // Get unique colors for active metrics
  const getCardColor = (cardIndex: number): string => {
    const metric = selectedMetrics[cardIndex];
    if (!metric) return '#94A3B8'; // slate-400 for empty state
    return METRIC_DEFINITIONS[metric].color;
  };

  return (
    <div className="bg-white rounded-xl p-6 animate-fade-in animate-slide-in-from-top" style={{ height: '517px' }}>
      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        {selectedMetrics.map((metricKey, cardIndex) => (
          <MetricCard
            key={cardIndex}
            cardIndex={cardIndex}
            selectedMetric={metricKey}
            metricStats={metricStats}
            onSelectMetric={handleMetricSelect}
            onRemove={handleRemoveCard}
            onToggle={handleCardToggle}
            color={getCardColor(cardIndex)}
            isActive={activeCards.has(cardIndex)}
            compareEnabled={compareEnabled}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6 w-full">
        <ResponsiveContainer width="100%" height={375}>
          <LineChart data={chartData} margin={{ top: 8, right: 18, left: 18, bottom: 8 }}>
            <CartesianGrid stroke="#F1F5F9" strokeDasharray="2 3" />
            {!compareEnabled && (
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
            )}
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => METRIC_DEFINITIONS.revenue.formatter(v)}
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              width={48}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => METRIC_DEFINITIONS.impressions.formatter(v)}
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              width={48}
            />
            <YAxis yAxisId="ctr" hide domain={[0, 10]} />

            <Tooltip
              cursor={{ stroke: '#E2E8F0', strokeDasharray: '5 5' }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) {
                  setHoveredMetric(null);
                  return null;
                }

                // Get the date from the label (format: "5/1" -> "May 1, 2025")
                const dateStr = String(label);
                const [month, day] = dateStr.split('/');
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = month && day ? monthNames[parseInt(month) - 1] || '' : '';
                const formattedDate = month && day ? `${monthName} ${parseInt(day)}, 2025` : String(label);

                // Calculate comparison date (7 days earlier for demo)
                let comparisonDateStr = '';
                if (compareEnabled && month && day) {
                  const dayNum = parseInt(day);
                  const monthNum = parseInt(month);
                  const comparisonDay = Math.max(1, dayNum - 7);
                  const comparisonMonthNum = comparisonDay < dayNum ? monthNum : Math.max(1, monthNum - 1);
                  const comparisonMonthName = monthNames[comparisonMonthNum - 1] || '';
                  comparisonDateStr = `${comparisonMonthName} ${comparisonDay}, 2025`;
                }

                // Only show active metrics (exclude comparison data keys)
                const activePayloads = payload.filter((item) => {
                  if (!item.dataKey) return false;
                  const dataKey = item.dataKey as string;
                  // Exclude comparison keys (ending with "Compare")
                  if (dataKey.endsWith('Compare')) return false;
                  const metricKey = dataKey as MetricKey;
                  const cardIndex = selectedMetrics.findIndex((m) => m === metricKey);
                  return cardIndex !== -1 && activeCards.has(cardIndex);
                });

                // Note: Dot hover detection will be handled by custom activeDot components
                // For now, check if we're showing a simplified view based on hoveredMetric state

                // If hovering over a specific dot (hoveredMetric is set), show simplified tooltip
                if (hoveredMetric) {
                  const def = METRIC_DEFINITIONS[hoveredMetric];
                  
                  // Find the payload item for the hovered metric
                  const metricPayload = payload.find((item) => item.dataKey === hoveredMetric);
                  const value = metricPayload ? (typeof metricPayload.value === 'number' ? metricPayload.value : Number(metricPayload.value)) : 0;
                  
                  // Get comparison value if comparison is enabled
                  let comparisonValue: number | null = null;
                  let delta: number | null = null;
                  if (compareEnabled) {
                    const compareDataKey = `${hoveredMetric}Compare` as string;
                    const compareItem = payload.find((p) => p.dataKey === compareDataKey);
                    if (compareItem) {
                      comparisonValue = typeof compareItem.value === 'number' ? compareItem.value : Number(compareItem.value);
                      // Calculate delta percentage
                      if (comparisonValue !== null && comparisonValue > 0) {
                        delta = ((value - comparisonValue) / comparisonValue) * 100;
                      } else if (comparisonValue !== null && value > 0) {
                        delta = 100;
                      } else {
                        delta = 0;
                      }
                    }
                  }
                  
                  return (
                    <div
                      style={{
                        background: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        padding: '12px 16px',
                        minWidth: '180px',
                      }}
                    >
                      {/* Metric name with delta badge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '14px' }}>
                          {def.label}
                        </span>
                        {delta !== null && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 500,
                              backgroundColor: delta >= 0 ? '#D1FAE5' : '#FEE2E2',
                              color: delta >= 0 ? '#065F46' : '#991B1B',
                            }}
                          >
                            <span>{delta >= 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(delta).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Current date value */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: def.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: '#475569', fontSize: '13px', flex: 1 }}>
                          {formattedDate}
                        </span>
                        <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '13px' }}>
                          {def.formatter(value)}
                        </span>
                      </div>
                      
                      {/* Comparison date value */}
                      {compareEnabled && comparisonValue !== null && comparisonDateStr && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              border: `2px solid ${def.color}`,
                              backgroundColor: 'transparent',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: '#475569', fontSize: '13px', flex: 1 }}>
                            {comparisonDateStr}
                          </span>
                          <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '13px' }}>
                            {def.formatter(comparisonValue)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    style={{
                      background: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      padding: '12px 16px',
                      minWidth: '180px',
                    }}
                  >
                    <div
                      style={{
                        color: '#0F172A',
                        fontWeight: 600,
                        fontSize: '14px',
                        marginBottom: '12px',
                        lineHeight: '20px',
                      }}
                    >
                      {compareEnabled && comparisonDateStr
                        ? `${formattedDate} vs ${comparisonDateStr}`
                        : formattedDate}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activePayloads.map((item, index) => {
                        const metricKey = item.dataKey as MetricKey;
                        const def = METRIC_DEFINITIONS[metricKey];
                        const value = typeof item.value === 'number' ? item.value : Number(item.value);
                        
                        if (!def) return null;

                        // Get comparison value if comparison is enabled
                        let comparisonValue: number | null = null;
                        let delta: number | null = null;
                        if (compareEnabled) {
                          const compareDataKey = `${metricKey}Compare` as string;
                          const compareItem = payload.find((p) => p.dataKey === compareDataKey);
                          if (compareItem) {
                            comparisonValue = typeof compareItem.value === 'number' ? compareItem.value : Number(compareItem.value);
                            // Calculate delta percentage
                            if (comparisonValue !== null && comparisonValue > 0) {
                              delta = ((value - comparisonValue) / comparisonValue) * 100;
                            } else if (comparisonValue !== null && value > 0) {
                              delta = 100;
                            } else {
                              delta = 0;
                            }
                          }
                        }

                        return (
                          <div
                            key={`${metricKey}-${index}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '13px',
                            }}
                          >
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: def.color,
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ color: '#475569', fontWeight: 500, minWidth: '90px' }}>
                              {def.label}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', justifyContent: 'flex-end' }}>
                              <span style={{ color: '#0F172A', fontWeight: 600 }}>
                                {def.formatter(value)}
                              </span>
                              {compareEnabled && delta !== null && (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    color: delta >= 0 ? '#065F46' : '#991B1B',
                                    textAlign: 'right',
                                  }}
                                >
                                  <span>{delta >= 0 ? '↑' : '↓'}</span>
                                  <span>{Math.abs(delta).toFixed(1)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            />

            {selectedMetrics.map((metricKey, idx) => {
              if (!metricKey) return null;
              // Only show line if card is active
              if (!activeCards.has(idx)) return null;
              const def = METRIC_DEFINITIONS[metricKey];
              const isHovered = hoveredMetric === metricKey;
              const shouldDim = hoveredMetric !== null && !isHovered;
              
              // Custom activeDot component to detect dot hover
              const CustomActiveDot = (props: any) => {
                return (
                  <circle
                    {...props}
                    r={4}
                    onMouseEnter={() => {
                      if (hoveredMetric !== metricKey) {
                        setHoveredMetric(metricKey);
                      }
                    }}
                    onMouseLeave={() => {
                      // Small delay to prevent flickering when moving between dots
                      setTimeout(() => {
                        if (hoveredMetric === metricKey) {
                          setHoveredMetric(null);
                        }
                      }, 50);
                    }}
                  />
                );
              };
              
              // Render main line (solid)
              const mainLine = (
                <Line
                  key={`${metricKey}-${idx}`}
                  type="monotone"
                  dataKey={metricKey}
                  yAxisId={def.yAxisId}
                  stroke={def.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={<CustomActiveDot />}
                  opacity={shouldDim ? 0.2 : 1}
                />
              );
              
              // Render comparison line (dotted) if comparison is enabled
              if (compareEnabled) {
                const compareDataKey = `${metricKey}Compare` as keyof typeof chartData[0];
                return (
                  <>
                    {mainLine}
                    <Line
                      key={`${metricKey}-${idx}-compare`}
                      type="monotone"
                      dataKey={compareDataKey}
                      yAxisId={def.yAxisId}
                      stroke={def.color}
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={<CustomActiveDot />}
                      opacity={shouldDim ? 0.2 : 0.7}
                    />
                  </>
                );
              }
              
              return mainLine;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface MetricCardProps {
  cardIndex: number;
  selectedMetric: MetricKey | null;
  metricStats: Record<MetricKey, { total: number; trend: number; comparisonTotal?: number; delta?: number }>;
  onSelectMetric: (cardIndex: number, metricKey: MetricKey) => void;
  onRemove: (cardIndex: number) => void;
  onToggle: (cardIndex: number) => void;
  color: string;
  isActive: boolean;
  compareEnabled?: boolean;
}

const MetricCard = ({
  cardIndex,
  selectedMetric,
  metricStats,
  onSelectMetric,
  onRemove,
  onToggle,
  color,
  isActive,
  compareEnabled = false,
}: MetricCardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const availableMetrics = Object.values(METRIC_DEFINITIONS);
  const filteredMetrics = availableMetrics.filter((m) =>
    m.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMetric = selectedMetric ? METRIC_DEFINITIONS[selectedMetric] : null;
  const stats = selectedMetric ? metricStats[selectedMetric] : null;

  return (
    <div
      className="relative bg-white p-4 transition-all cursor-pointer"
      style={{ 
        borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
        borderRadius: cardIndex === 0 || cardIndex === 1 || cardIndex === 2 || cardIndex === 3 ? '12px 12px 0px 0px' : '12px'
      }}
      onClick={(e) => {
        // Don't toggle if clicking on interactive elements (buttons, inputs)
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input')) {
          return;
        }
        onToggle(cardIndex);
      }}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="Remove card"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(cardIndex);
        }}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors z-10"
      >
        <FontAwesomeIcon icon={faXmark} className="text-xs" />
      </button>

      {/* Metric selector */}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded z-10"
            style={{ color: selectedMetric ? '#475569' : '#3B82F6' }}
          >
            <span>{currentMetric ? currentMetric.label : 'Select metric'}</span>
            <FontAwesomeIcon icon={faChevronDown} className="text-slate-400 text-xs" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-64 p-2 animate-fade-in"
            sideOffset={8}
            align="start"
          >
            {/* Search input */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              />
            </div>

            {/* Metric list */}
            <div className="max-h-64 overflow-y-auto">
              {filteredMetrics.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">No metrics found</div>
              ) : (
                filteredMetrics.map((metric) => (
                  <button
                    key={metric.key}
                    type="button"
                    onClick={() => {
                      onSelectMetric(cardIndex, metric.key);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors"
                  >
                    <span>{metric.label}</span>
                  </button>
                ))
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Value and trend */}
      {currentMetric && stats ? (
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-slate-900 w-full">
              {currentMetric.formatter(stats.total)}
            </div>
            {compareEnabled && stats.delta !== undefined && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-2xl text-xs font-medium h-8"
                style={{
                  backgroundColor: stats.delta >= 0 ? '#D1FAE5' : '#FEE2E2',
                  color: stats.delta >= 0 ? '#065F46' : '#991B1B',
                }}
              >
                <span>{stats.delta >= 0 ? '↑' : '↓'}</span>
                <span>{Math.abs(stats.delta).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2 h-8" />
      )}
    </div>
  );
};

export default GraphView;
