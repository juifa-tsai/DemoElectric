import React, { useState } from 'react';
import { Config, MarketRow, Candidate } from '../types';
import { generateRandomCandidates, exportToCsv } from '../utils/gain';
import Chart from './Chart';
import styles from '../styles/TopNPage.module.css';
import appStyles from '../styles/App.module.css';

interface TopNPageProps {
  config: Config;
  horizonData: MarketRow[];
}

const TopNPage: React.FC<TopNPageProps> = ({ config, horizonData }) => {
  const [N, setN] = useState<number>(8);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRun = async () => {
    if (horizonData.length === 0) return;
    
    setIsRunning(true);
    
    // Add slight delay to show loading state
    setTimeout(() => {
      const generatedCandidates = generateRandomCandidates(horizonData, config, N);
      setCandidates(generatedCandidates);
      setIsRunning(false);
    }, 500);
  };

  const handleExportCsv = () => {
    if (candidates.length === 0) return;
    
    const csvContent = exportToCsv(candidates);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-candidates-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartData = candidates.length > 0 ? {
    labels: candidates[0].params.map(p => `${p.hour}:00`),
    datasets: candidates.map((candidate, index) => ({
      label: candidate.id,
      data: candidate.params.map(p => p.gain),
      borderColor: `hsl(${index * 72}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 72}, 70%, 50%, 0.1)`,
      tension: 0.1
    }))
  } : { labels: [], datasets: [] };

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Performance Comparison Across Time Slots'
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Expected Gain (NTD)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Hour'
        }
      }
    }
  };

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Number of slots to consider:</label>
          <input
            type="number"
            className={styles.input}
            value={N}
            onChange={(e) => setN(parseInt(e.target.value))}
            min="1"
            max={Math.min(72, horizonData.length)}
          />
        </div>
        <button
          className={styles.runButton}
          onClick={handleRun}
          disabled={isRunning || horizonData.length === 0}
        >
          {isRunning ? 'Running...' : 'Run Optimization'}
        </button>
      </div>

      {candidates.length > 0 && (
        <>
          <div className={styles.candidatesGrid}>
            {candidates.map((candidate, index) => (
              <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.candidateTitle}>
                  #{index + 1} {candidate.id}
                </div>
                <div className={styles.candidateGain}>
                  {candidate.totalGain.toLocaleString()} NTD
                </div>
                <div className={styles.candidateDetails}>
                  <div><strong>Avg P₀:</strong></div>
                  <div>{candidate.avgP0.toFixed(1)} NTD/MW·h</div>
                  <div><strong>Slots:</strong></div>
                  <div>{candidate.params.length}</div>
                </div>
                <div className={styles.candidateHours}>
                  <strong>Hours:</strong> {candidate.hours.map(h => `${h}:00`).join(', ')}
                </div>
              </div>
            ))}
          </div>

          <button
            className={styles.exportButton}
            onClick={handleExportCsv}
          >
            Export Parameter Table (CSV)
          </button>

          <div className={styles.chartContainer}>
            <Chart data={chartData} options={chartOptions} type="line" height={350} />
          </div>
        </>
      )}

      {candidates.length === 0 && !isRunning && (
        <div className={appStyles.card}>
          <p>Click "Run Optimization" to generate random candidate combinations and see the top 5 results.</p>
        </div>
      )}

      <div className={appStyles.disclaimer}>
        <strong>Note:</strong> This demo uses randomized schedule generation for candidate exploration. 
        A production system would use sophisticated optimization algorithms for better results.
      </div>
    </div>
  );
};

export default TopNPage;