export type RoleKey = "USER" | "GUIDE" | "ADMIN";

export interface UserRecord {
  id: number;
  name: string;
  lastName: string;
  email: string;
  authProvider: string;
  roles: string[];
}

export interface PendingGuide {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  description: string;
  license: string;
  cv: string;
  languages: string[];
  guideStatus: string;
}
