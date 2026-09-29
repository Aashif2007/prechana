export const CATEGORY_LABELS: Record<string, string> = {
  pothole: "Pothole",
  streetlight: "Streetlight",
  garbage: "Garbage",
  drainage: "Drainage overflow",
  water_leakage: "Water leakage",
  damaged_road: "Damaged road",
  fallen_tree: "Fallen tree",
  public_infrastructure: "Public infrastructure",
  other: "Other civic issue",
};

// Category -> department type. Lives in code so AI never decides routing.
export const DEPARTMENT_FOR_CATEGORY: Record<string, string> = {
  pothole: "roads",
  streetlight: "electrical_services",
  garbage: "sanitation",
  drainage: "drainage_water",
  water_leakage: "drainage_water",
  damaged_road: "roads",
  fallen_tree: "horticulture",
  public_infrastructure: "general",
  other: "general",
};

export const DEPARTMENT_LABELS: Record<string, string> = {
  roads: "Roads",
  electrical_services: "Electrical Services",
  sanitation: "Sanitation",
  drainage_water: "Drainage & Water",
  horticulture: "Horticulture",
  general: "General (manual review)",
};
