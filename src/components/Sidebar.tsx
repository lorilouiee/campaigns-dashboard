import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faFileLines,
  faChartLine,
  faChartColumn,
  faCalendar,
  faBullhorn,
  faChartPie,
  faBriefcase,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  const menuItems = [
    { icon: faBars, label: 'Menu' },
    { icon: faFileLines, label: 'Documents' },
    { icon: faChartLine, label: 'Analytics' },
    { icon: faChartColumn, label: 'Reports' },
    { icon: faCalendar, label: 'Calendar' },
    { icon: faBullhorn, label: 'Campaigns', active: true },
    { icon: faChartPie, label: 'Insights' },
    { icon: faBriefcase, label: 'Business' },
    { icon: faGear, label: 'Settings' },
  ];

  return (
    <div className="w-16 bg-white flex flex-col items-center justify-start py-4" style={{ fontSize: '14px', fontWeight: 500, paddingLeft: '36px', paddingRight: '36px' }}>
      {menuItems.map((item, index) => (
        <div
          key={index}
          className={`w-12 flex items-center justify-center rounded-lg mb-2 cursor-pointer transition-colors ${
            item.active
              ? ''
              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
          }`}
          style={{ 
            height: '48px',
            ...(item.active ? { backgroundColor: 'rgba(54, 125, 254, 0.15)' } : {})
          }}
          title={item.label}
        >
          <FontAwesomeIcon 
            icon={item.icon} 
            className="text-base" 
            style={{ 
              transform: 'scale(0.85)',
              opacity: 0.9,
              color: item.active ? 'rgba(54, 125, 254, 1)' : undefined,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
