export interface IncompleteApplicationDto {
  userId: string;
  screenTrackingId: string;
  name: string;
  approvedUpTo: number;
  selectedAmount: number;
  dateCreated: Date;
  phone: string;
  email: string;
  location: string;
  progress: string;
}
