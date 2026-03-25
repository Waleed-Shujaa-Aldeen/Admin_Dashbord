export type DoctorStatus = "Active" | "Inactive";

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  email: string;
  phone: string;
  gender: string;
  status: DoctorStatus;
  licenseNumber: string;
  biography: string;
  address: string;
  consultationFee: number;
  yearsOfExperience: number;
  licenseIssuedAt: string;
  licenseExpiryAt: string;
}

export interface DoctorPayload {
  user: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    gender: string;
  };
  
  // Doctor Profile Fields
  specialization: string;
  licenseNumber: string;
  biography: string;
  address: string;
  consultationFee: number;
  yearsOfExperience: number;
  licenseIssuedAt?: string;
  licenseExpiryAt?: string;
  status: DoctorStatus;
  isAvailable: boolean;
}
