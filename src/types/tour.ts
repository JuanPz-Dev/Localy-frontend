export type Category =
  | "HISTORICAL"
  | "GASTRONOMIC"
  | "ISLANDS_AND_BEACHES"
  | "CULTURAL"
  | "NIGHTLIFE";

export interface Location {
  city: string;
  meetingAddress: string;
}

export interface TourSchedule {
  day: string;
  startTime: string;
}

export interface ServiceFeature {
  name: string;
  included: boolean;
}

export interface Tour {
  id: number;
  title: string;
  description: string;
  photos: string[];
  price: number;
  minParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
  category: Category;
  serviceStatus: string;
  guideName: string;
  guideProfilePicture: string | null;
  schedules: TourSchedule[];
  features: ServiceFeature[];
  meetingLocation: Location;
  averageRating: number | null;
  reviewCount: number;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}
