export type ReservationStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
export type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "NEQUI";

export interface Reservation {
  id: number;
  tourId: number | null;
  tourName: string | null;
  guideName: string | null;
  touristName: string | null;
  reservationDate: string | null;
  startTime: string | null;
  adults: number | null;
  children: number | null;
  totalPrice: number | null;
  status: ReservationStatus;
  createdAt: string | null;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}

export interface PaymentResponse {
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
}

export interface GuideReservation {
  id: number;
  tourId: number;
  tourName: string;
  guideName: string;
  touristName: string;
  reservationDate: string;
  startTime: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
}
