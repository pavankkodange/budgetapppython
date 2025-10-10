export interface TaxDeduction {
  id: string;
  year: number;
  deduction_type: string; // e.g., "Medical Expenses", "Charitable Contributions"
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