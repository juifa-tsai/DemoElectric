import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Config, MarketRow } from './types';
import { loadDataFromFile, sortMarketData, findIndexByDateHour, takeNext } from './utils/data';
import ConfigDrawer from './components/ConfigDrawer';
import ExpectedGainPage from './components/ExpectedGainPage';
import TopNPage from './components/TopNPage';
import styles from './styles/App.module.css';

const defaultConfig: Config = {
  essPowerMW: 2.5,
  essEnergyMWh: 5,
  drPowerMW: 20,
  drEnergyMWh: 40,
  energyCost: 9000,
  epsilon: 0.25,
  dtbHours: 2,
  dteHours: 2
};

function App() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [data, setData] = useState<MarketRow[]>([]);
  const [startDate, setStartDate] = useState<string>('2025-09-17');
  const [startHour, setStartHour] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'expected' | 'topn'>('expected');
  const [forwardData, setForwardData] = useState<MarketRow[]>([]);
  const [horizonData, setHorizonData] = useState<MarketRow[]>([]);

  useEffect(() => {
    loadDataFromFile().then(rawData => {
      const sortedData = sortMarketData(rawData);
      setData(sortedData);
      
      if (sortedData.length > 0) {
        setStartDate(sortedData[0].tranDate);
      }
    });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const startIndex = findIndexByDateHour(data, startDate, startHour);
      const forward24h = takeNext(data, startIndex, 24);
      const horizon72h = takeNext(data, startIndex, 72);
      
      setForwardData(forward24h);
      setHorizonData(horizon72h);
    }
  }, [data, startDate, startHour]);

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const rawData = jsonData.data || [];
          const sortedData = sortMarketData(rawData);
          setData(sortedData);
          
          if (sortedData.length > 0) {
            setStartDate(sortedData[0].tranDate);
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          alert('Failed to parse data file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Supplemental Reserve Simulator (TW)</h1>
          
          <div className={styles.timeGroup}>
            <span className={styles.timeLabel}>Start Time:</span>
            <input
              type="date"
              className={styles.timeInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <select
              className={styles.timeInput}
              value={startHour}
              onChange={(e) => setStartHour(parseInt(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <button
            className={styles.configButton}
            onClick={() => setIsConfigOpen(!isConfigOpen)}
          >
            Config
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        <div 
          className={`${styles.drawerOverlay} ${isConfigOpen ? styles.open : ''}`}
          onClick={() => setIsConfigOpen(false)}
        />
        
        <div className={`${styles.drawer} ${isConfigOpen ? styles.open : ''}`}>
          <ConfigDrawer
            isOpen={isConfigOpen}
            config={config}
            onConfigChange={(newConfig) => {
              setConfig(newConfig);
              setIsConfigOpen(false);
            }}
          />
        </div>

        <main className={styles.pageContent}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${currentPage === 'expected' ? styles.active : ''}`}
              onClick={() => setCurrentPage('expected')}
            >
              Expected Gain
            </button>
            <button
              className={`${styles.tab} ${currentPage === 'topn' ? styles.active : ''}`}
              onClick={() => setCurrentPage('topn')}
            >
              Top-N Best Combinations
            </button>
          </div>

          {currentPage === 'expected' ? (
            <ExpectedGainPage
              config={config}
              data={data}
              startDate={startDate}
              startHour={startHour}
              forwardData={forwardData}
            />
          ) : (
            <TopNPage
              config={config}
              horizonData={horizonData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;