import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any;
  options?: any;
  type?: 'line' | 'bar';
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ 
  data, 
  options = {}, 
  type = 'line',
  height = 300 
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<any>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()} NTD`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#DEDEDE'
        }
      },
      y: {
        grid: {
          color: '#DEDEDE'
        },
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString();
          }
        }
      }
    },
    ...options
  };

  const ChartComponent = type === 'bar' ? Bar : Line;

  return (
    <div style={{ height: `${height}px` }}>
      <ChartComponent data={data} options={defaultOptions} />
    </div>
  );
};

export default Chart;