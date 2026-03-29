import type { ExternalBlob, TaxiRateType } from "../backend";

// Extended TaxiRoute with additional fields for driver/vehicle info
export interface TaxiRouteExtended {
  id: string;
  destination: string;
  origin: string;
  rate: number;
  isActive: boolean;
  estimatedKm?: number;
  rateType: TaxiRateType;
  driverName?: string;
  carModel?: string;
  photo?: ExternalBlob;
}
