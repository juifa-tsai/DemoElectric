export type MarketRow = {
  tranDate: string;
  tranHour: string | number;
  marginalPrice: number;
  supPrice: number;
  supBidQse?: number;
  supDemand?: number;
  [key: string]: any;
};

export type Config = {
  essPowerMW: number;
  essEnergyMWh: number;
  drPowerMW: number;
  drEnergyMWh: number;
  energyCost: number; // NTD/MWh
  epsilon: number; // 0..1
  dtbHours: number; // 2..8
  dteHours: number; // >=2
  energyPriceOverride?: number; // optional P_e
};

export type GainResult = {
  hour: number;
  date: string;
  P0: number;
  standby: number;
  exec: number;
  total: number;
  Cb: number;
};

export type Candidate = {
  id: string;
  hours: number[];
  totalGain: number;
  avgP0: number;
  params: CandidateParam[];
};

export type CandidateParam = {
  hour: number;
  Cb: number;
  dtb: number;
  dte: number;
  epsilon: number;
  gain: number;
  P0: number;
};