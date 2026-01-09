import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCalendar,
  faTriangleExclamation,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../types';

interface AlertBadgeProps {
  alert: Alert;
  onClick?: (e: React.MouseEvent) => void;
}

const AlertBadge = ({ alert, onClick }: AlertBadgeProps) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'ad-groups':
      case 'high-roas':
        return faBell;
      case 'ends-soon':
        return faCalendar;
      case 'budget-recommendation':
        return faTriangleExclamation;
      case 'great-pacing':
        return faThumbsUp;
      default:
        return faBell;
    }
  };

  const getColorClasses = () => {
    switch (alert.color) {
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Get base classes
  const baseClasses = `inline-flex items-center gap-1.5 py-1 text-xs`;
  
  // Padding classes
  const paddingClass = 'px-4';
  
  // Font weight
  const fontWeightClass = 'font-normal';
  
  // Border and border radius
  const borderClass = '';
  const borderRadiusClass = 'rounded-2xl';
  
  // Inline styles
  const badgeStyle: React.CSSProperties = {
    border: '0px none rgba(0, 0, 0, 0)',
    width: '155px',
    justifyContent: 'center',
    borderRadius: '16px',
    fontSize: '12px',
  };
  
  const iconStyle: React.CSSProperties = {
    width: '10px',
    height: '10px',
  };

  return (
    <span
      className={`${baseClasses} ${paddingClass} ${fontWeightClass} ${borderClass} ${borderRadiusClass} ${getColorClasses()} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      style={badgeStyle}
      onClick={onClick}
    >
      <FontAwesomeIcon 
        icon={getIcon()} 
        className="text-xs" 
        style={iconStyle}
      />
      <span style={{ width: 'fit-content' }}>{alert.text}</span>
    </span>
  );
};

export default AlertBadge;
