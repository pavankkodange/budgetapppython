export interface TaxDeduction {
  id: string;
  year: number;
  deductionType: string; // e.g., "Medical Expenses", "Charitable Contributions"
  amount: number;
  description?: string;
  createdAt: Date;
  attachments?: DocumentAttachment[]; // Array of document attachments
}

// Document attachment type for various documents
export interface DocumentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  documentType: string;
  fileUrl?: string; // For cloud storage
  fileData?: string; // Base64 encoded file data for local storage
}

// Define PolicyDocument type to match DocumentAttachment
export interface PolicyDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  documentType: "Policy Document" | "Premium Receipt" | "Claim Form" | "Medical Reports" | "Other";
  fileUrl?: string;
  fileData?: string;
}