import React, { useState, useEffect } from 'react';
import { Config } from '../types';
import styles from '../styles/ConfigDrawer.module.css';

interface ConfigDrawerProps {
  isOpen: boolean;
  config: Config;
  onConfigChange: (config: Config) => void;
}

const ConfigDrawer: React.FC<ConfigDrawerProps> = ({
  isOpen,
  config,
  onConfigChange
}) => {
  const [formData, setFormData] = useState<Config>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (field: keyof Config, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onConfigChange(formData);
  };

  return (
    <div className={styles.drawer}>
      <h2 className={styles.title}>Configuration</h2>
      
      <form className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>ESS Parameters</h3>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>ESS Power (MW)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.essPowerMW}
              onChange={(e) => handleInputChange('essPowerMW', parseFloat(e.target.value))}
              min="1.1"
              max="3.5"
              step="0.1"
            />
            <div className={styles.range}>Range: 1.1 – 3.5 MW</div>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>ESS Energy (MWh)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.essEnergyMWh}
              onChange={(e) => handleInputChange('essEnergyMWh', parseFloat(e.target.value))}
              min="2.2"
              max="7"
              step="0.1"
            />
            <div className={styles.range}>Range: 2.2 – 7 MWh</div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Factory DR Parameters</h3>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>DR Power (MW)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.drPowerMW}
              onChange={(e) => handleInputChange('drPowerMW', parseFloat(e.target.value))}
              min="8"
              max="32"
              step="1"
            />
            <div className={styles.range}>Range: 8 – 32 MW</div>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>DR Energy Window (MWh)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.drEnergyMWh}
              onChange={(e) => handleInputChange('drEnergyMWh', parseFloat(e.target.value))}
              min="15"
              max="60"
              step="5"
            />
            <div className={styles.range}>Range: 15 – 60 MWh</div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Economic Parameters</h3>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Energy Cost Baseline (NTD/MWh)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.energyCost}
              onChange={(e) => handleInputChange('energyCost', parseFloat(e.target.value))}
              min="8000"
              max="10000"
              step="100"
            />
            <div className={styles.range}>Range: 8,000 – 10,000 NTD/MWh</div>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Energy Price Override (NTD/MWh)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.energyPriceOverride || ''}
              onChange={(e) => handleInputChange('energyPriceOverride', parseFloat(e.target.value) || undefined)}
              placeholder="Optional override for P_e"
            />
            <div className={styles.range}>Optional: overrides energy cost for execution</div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Operational Parameters</h3>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Dispatch Ratio ε</label>
            <input
              type="number"
              className={styles.input}
              value={formData.epsilon}
              onChange={(e) => handleInputChange('epsilon', parseFloat(e.target.value))}
              min="0"
              max="1"
              step="0.05"
            />
            <div className={styles.range}>Range: 0 – 1 (default: 0.25)</div>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Bid Duration ΔT_b (hours)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.dtbHours}
              onChange={(e) => handleInputChange('dtbHours', parseInt(e.target.value))}
              min="2"
              max="8"
              step="1"
            />
            <div className={styles.range}>Range: 2 – 8 hours</div>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Execution Window ΔT_e (hours)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.dteHours}
              onChange={(e) => handleInputChange('dteHours', parseInt(e.target.value))}
              min="2"
              step="1"
            />
            <div className={styles.range}>Minimum: 2 hours</div>
          </div>
        </div>

        <button
          type="button"
          className={styles.applyButton}
          onClick={handleApply}
        >
          Apply Configuration
        </button>
      </form>
    </div>
  );
};

export default ConfigDrawer;