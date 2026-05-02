export interface DurationPreset {
  id: string;
  label: string;
  minutes: number;
}

export const DURATION_PRESETS: DurationPreset[] = [
  { id: 'tiny', label: '5 min', minutes: 5 },
  { id: 'short', label: '15 min', minutes: 15 },
  { id: 'classic', label: '25 min', minutes: 25 },
  { id: 'deep', label: '45 min', minutes: 45 },
];

export const DEFAULT_PRESET_ID = 'classic';
