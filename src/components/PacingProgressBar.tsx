interface PacingProgressBarProps {
  ratio: number;
}

const PacingProgressBar = ({ ratio }: PacingProgressBarProps) => {
  const formatRatio = () => {
    return `${ratio}%`;
  };

  const getBarColorClass = () => {
    if (ratio <= 30) {
      return 'bg-red-100';
    } else if (ratio <= 50) {
      return 'bg-orange-100';
    } else {
      return 'bg-green-100';
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-sm font-normal text-gray-700 min-w-[3rem]">
        {formatRatio()}
      </span>
      <div className="flex-1 relative h-2 bg-gray-200 rounded-full overflow-visible" style={{ width: '125px' }}>
        <div
          className={`h-full transition-all duration-300 rounded-full ${getBarColorClass()}`}
          style={{
            width: `${Math.min(ratio, 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

export default PacingProgressBar;
