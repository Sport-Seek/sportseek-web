export type SpotLocation = {
  latitude: number;
  longitude: number;
};

export type SpotEquipmentProperty = {
  id?: string;
  propertyId: string;
  propertyKey: string;
  propertyValue: string;
};

export type SpotEquipment = {
  id?: string;
  equipmentId: string;
  properties: SpotEquipmentProperty[];
};

export type SpotPhoto = {
  id?: string;
  url?: string;
  uri?: string;
  description?: string | null;
};

export type Spot = {
  id: string;
  sportId: string;
  sportName?: string;
  statusId?: string;
  location: SpotLocation | null;
  city: string;
  zipCode: string;
  address?: string | null;
  openHour?: string | null;
  closedHour?: string | null;
  haveWaterCooler?: boolean;
  haveLighting?: boolean;
  equipments?: SpotEquipment[];
  equipmentProperties?: Record<string, Record<string, string>>;
  photos?: SpotPhoto[];
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
};
