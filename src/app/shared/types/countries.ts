// Country Interface
export interface Country {
  name: string;
  iso2: string;
  iso3: string;
  phonecode: string;
  capital: string;
  currency: string;
  native: string;
  emoji: string;
}

// State Interface
export interface State {
  name: string;
  iso2: string;
}

// City Interface
export interface City {
  name: string;
  latitude: string;
  longitude: string;
}
