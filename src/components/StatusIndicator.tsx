import React from 'react';

interface StatusIndicatorProps {
  status: 'normal' | 'low' | 'high';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  let statusColor = '';
  let statusText = '';

  switch (status) {
    case 'normal':
      statusColor = 'bg-green-400';
      statusText = 'Normal';
      break;
    case 'low':
      statusColor = 'bg-blue-400';
      statusText = 'Low';
      break;
    case 'high':
      statusColor = 'bg-red-400';
      statusText = 'High';
      break;
    default:
      statusColor = 'bg-gray-400';
      statusText = 'Unknown';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor} text-white`}>
      {statusText}
    </span>
  );
};

export default StatusIndicator;