import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { TrendingUp, Clock, Zap } from 'lucide-react';
import { Config, MarketRow, GainResult } from '../types';
import { calculateForwardGains } from '../utils/gain';
import { formatDateTime } from '../utils/data';
import Chart from './Chart';
import styles from '../styles/App.module.css';

interface ExpectedGainPageProps {
  config: Config;
  data: MarketRow[];
  startDate: string;
  startHour: number;
  forwardData: MarketRow[];
}

const ExpectedGainPage: React.FC<ExpectedGainPageProps> = ({
  config,
  data,
  startDate,
  startHour,
  forwardData
}) => {
  const [gains, setGains] = useState<GainResult[]>([]);

  useEffect(() => {
    if (forwardData.length > 0) {
      const calculatedGains = calculateForwardGains(forwardData, config);
      setGains(calculatedGains);
    }
  }, [forwardData, config, startDate, startHour]);

  const totalGain = gains.reduce((sum, gain) => sum + gain.total, 0);
  const clearingPrice = gains.length > 0 ? gains[0].P0 : 0;
  const maxGainHour = gains.reduce((max, gain) => 
    gain.total > max.total ? gain : max, gains[0] || { total: 0, hour: 0 }
  );
  const startTimeGain = gains.length > 0 ? gains[0].total : 0;
  
  const Cmax = config.essPowerMW + config.drPowerMW;
  const Cb = Cmax;

  const chartData = {
    labels: gains.map(gain => formatDateTime(gain.date, gain.hour)),
    datasets: [
      {
        label: 'Expected Gain',
        data: gains.map(gain => gain.total),
        borderColor: '#20AF24',
        backgroundColor: 'rgba(32, 175, 36, 0.1)',
        tension: 0.1,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Clearing Price (P₀)',
        data: gains.map(gain => gain.P0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: false,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: '24-Hour Expected Gain Forecast'
      }
    },
    scales: {
      y: {
        position: 'left',
        title: {
          display: true,
          text: 'Expected Gain (NTD)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Clearing Price P₀ (NTD/MW·h)'
        },
        grid: {
          drawOnChartArea: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  };

  return (
    <div>
      <div className={styles.summaryTiles}>
        <div className={styles.tile}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <TrendingUp size={24} color="#20AF24" />
          </div>
          <div className={styles.tileValue}>{startTimeGain.toLocaleString()}</div>
          <div className={styles.tileLabel}>Expected Gain (NTD)</div>
        </div>
        <div className={styles.tile}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <Zap size={24} color="#20AF24" />
          </div>
          <div className={styles.tileValue}>{clearingPrice.toFixed(1)}</div>
          <div className={styles.tileLabel}>Clearing Price (NTD/MW·h)</div>
        </div>
        <div className={styles.tile}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <Clock size={24} color="#20AF24" />
          </div>
          <div className={styles.tileValue}>{maxGainHour.hour}:00</div>
          <div className={styles.tileLabel}>Max Gain Hour</div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Input Parameters</h3>
        <div className={styles.inputTime}>
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>Start Date</div>
            <div className={styles.inputValue}>{format(new Date(startDate), 'yyyy-MM-dd')}</div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>Start Hour</div>
            <div className={styles.inputValue}>{startHour}:00</div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>Bid Duration ΔT_b</div>
            <div className={styles.inputValue}>{config.dtbHours} hours</div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>Execution Window ΔT_e</div>
            <div className={styles.inputValue}>{config.dteHours} hours</div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>Dispatch Ratio ε</div>
            <div className={styles.inputValue}>{config.epsilon}</div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>Energy Cost</div>
            <div className={styles.inputValue}>{config.energyCost.toLocaleString()} NTD/MWh</div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>Capacity C_b</div>
            <div className={styles.inputValue}>{Cb.toFixed(1)} MW</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>24-Hour Gain Forecast</h3>
        <Chart data={chartData} options={chartOptions} height={400} />
      </div>

      <div className={styles.disclaimer}>
        <strong>Disclaimer:</strong> Demo uses simplified constraints and supPrice from data.txt as forward P₀(t) for illustration. 
        P_b is not modeled; capacity revenue uses pay-as-cleared P₀. No SOC modeling included.
      </div>
    </div>
  );
};

export default ExpectedGainPage;