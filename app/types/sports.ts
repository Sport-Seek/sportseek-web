export type PropertyScope = "sport" | "equipment" | "infrastructure";

export type PropertyPrimitiveType = "string" | "integer" | "float" | "boolean";

export type PropertyType = PropertyPrimitiveType | "list";

export type PropertyValue = {
  id: string;
  propertyId: string;
  value: string;
  createdAt: string;
  updatedAt: string | null;
};

export type Property = {
  id: string;
  scope: PropertyScope;
  key: string;
  label: string;
  type: PropertyType;
  itemType: PropertyPrimitiveType | null;
  logoSvg: string | null;
  createdAt: string;
  updatedAt: string | null;
  values: PropertyValue[];
};

export type Equipment = {
  id: string;
  name: string;
  slug: string;
  logoSvg: string | null;
  createdAt: string;
  updatedAt: string | null;
  properties: Property[];
};

export type InfrastructurePropertyValue = {
  infrastructureId: string;
  propertyValueId: string;
  property: Property;
  value: PropertyValue;
};

export type Infrastructure = {
  id: string;
  sportId: string;
  equipmentId: string;
  createdAt: string;
  updatedAt: string | null;
  equipment: Equipment;
  propertyValues?: InfrastructurePropertyValue[];
};

export type Sport = {
  id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: string;
  updatedAt: string | null;
  logoSvg: string;
  equipments: Equipment[];
};
