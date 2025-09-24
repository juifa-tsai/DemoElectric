import { Config, MarketRow, GainResult, Candidate, CandidateParam } from '../types';
import { normalizeHour, formatDateTime } from './data';

export const calculateGain = (
  marketRow: MarketRow,
  config: Config,
  Cb?: number
): GainResult => {
  const Cmax = config.essPowerMW + config.drPowerMW;
  const effectiveCb = Cb || Cmax;
  
  const P0 = marketRow.supPrice;
  const Pe = config.energyPriceOverride || config.energyCost;
  const rho = 1.0; // award probability
  
  // Stand-by revenue
  const standby = rho * effectiveCb * P0 * config.dtbHours;
  
  // Execution margin
  const execMWh = config.epsilon * effectiveCb * config.dteHours;
  const exec = rho * execMWh * (Pe - config.energyCost);
  
  return {
    hour: normalizeHour(marketRow.tranHour),
    date: marketRow.tranDate,
    P0,
    standby,
    exec,
    total: standby + exec,
    Cb: effectiveCb
  };
};

export const calculateForwardGains = (
  forwardData: MarketRow[],
  config: Config
): GainResult[] => {
  return forwardData.map(row => calculateGain(row, config));
};

export const generateRandomCandidates = (
  horizonData: MarketRow[],
  config: Config,
  N: number,
  numCandidates: number = 200
): Candidate[] => {
  const candidates: Candidate[] = [];
  const Cmax = config.essPowerMW + config.drPowerMW;
  const epsilonOptions = [0.1, 0.25, 0.5];
  
  for (let c = 0; c < numCandidates; c++) {
    // Select N random hours
    const selectedIndices = new Set<number>();
    while (selectedIndices.size < Math.min(N, horizonData.length)) {
      selectedIndices.add(Math.floor(Math.random() * horizonData.length));
    }
    
    const hours = Array.from(selectedIndices).sort((a, b) => a - b);
    const params: CandidateParam[] = [];
    let totalEnergyUsed = 0;
    let totalGain = 0;
    let totalP0 = 0;
    
    // Generate parameters for each selected hour
    for (const hourIdx of hours) {
      const marketRow = horizonData[hourIdx];
      const Cb = Math.random() * (Cmax - 0.5 * Cmax) + 0.5 * Cmax;
      const dtb = Math.floor(Math.random() * 7) + 2; // 2-8
      const dte = Math.floor(Math.random() * 3) + 2; // 2-4
      const epsilon = epsilonOptions[Math.floor(Math.random() * epsilonOptions.length)];
      
      totalEnergyUsed += epsilon * Cb * dte;
      
      const gainResult = calculateGain(marketRow, {
        ...config,
        dtbHours: dtb,
        dteHours: dte,
        epsilon
      }, Cb);
      
      params.push({
        hour: normalizeHour(marketRow.tranHour),
        Cb,
        dtb,
        dte,
        epsilon,
        gain: gainResult.total,
        P0: gainResult.P0
      });
      
      totalGain += gainResult.total;
      totalP0 += gainResult.P0;
    }
    
    // Energy feasibility check
    const maxEnergy = config.drEnergyMWh + config.essEnergyMWh;
    if (totalEnergyUsed <= maxEnergy) {
      candidates.push({
        id: `candidate-${c + 1}`,
        hours: hours.map(idx => normalizeHour(horizonData[idx].tranHour)),
        totalGain,
        avgP0: totalP0 / params.length,
        params
      });
    }
  }
  
  return candidates
    .sort((a, b) => b.totalGain - a.totalGain)
    .slice(0, 5);
};

export const exportToCsv = (candidates: Candidate[]): string => {
  const headers = [
    'candidateId',
    'hour',
    'Cb',
    'dtb',
    'dte',
    'epsilon',
    'gain',
    'P0'
  ];
  
  const rows = [headers.join(',')];
  
  candidates.forEach(candidate => {
    candidate.params.forEach(param => {
      rows.push([
        candidate.id,
        param.hour,
        param.Cb.toFixed(2),
        param.dtb,
        param.dte,
        param.epsilon,
        param.gain.toFixed(2),
        param.P0.toFixed(2)
      ].join(','));
    });
  });
  
  return rows.join('\n');
};