// Country Interface
export interface Country {
  key: string;
  value: string;
}

// State Interface
export interface State {
  key: string;
  value: string;
  iso_a2: string;
}

// City Interface
export interface City {
  key: string;
  value: string;
  iso_a2: string;
  state_code: string;
}
