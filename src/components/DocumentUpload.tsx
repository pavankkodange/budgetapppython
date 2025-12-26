import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentAttachment } from '@/types';
import { Upload, FileText, Trash2, Download, Eye } from 'lucide-react';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DocumentUploadProps {
  documents: DocumentAttachment[];
  onUpload: (document: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
  onRemove: (documentId: string) => void;
}

const documentTypes = [
  'Policy Document',
  'Premium Receipt',
  'Claim Form',
  'Medical Reports',
  'Other'
];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onUpload,
  onRemove,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        showError('Only PDF, Word documents, and images (JPEG, PNG) are allowed');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      showError('Please select a file and document type');
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;

        const documentData: Omit<DocumentAttachment, 'id' | 'uploadDate'> = {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          documentType: documentType,
          fileData: base64Data,
        };

        onUpload(documentData);
        setSelectedFile(null);
        setDocumentType('');

        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      };

      reader.onerror = () => {
        showError('Failed to read file');
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      showError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadDocument = (doc: DocumentAttachment) => {
    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewDocument = (doc: DocumentAttachment) => {
    if (doc.fileData) {
      const newWindow = window.open();
      if (newWindow) {
        if (doc.fileType.startsWith('image/')) {
          newWindow.document.write(`
            <html>
              <head><title>${doc.fileName}</title></head>
              <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
                <img src="${doc.fileData}" style="max-width:100%;max-height:100%;object-fit:contain;" />
              </body>
            </html>
          `);
        } else if (doc.fileType === 'application/pdf') {
          newWindow.location.href = doc.fileData;
        } else {
          showError('Preview not available for this file type');
          newWindow.close();
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported: PDF, Word, JPEG, PNG (max 10MB)
              </p>
            </div>

            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select onValueChange={setDocumentType} value={documentType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedFile && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Badge variant="outline">{formatFileSize(selectedFile.size)}</Badge>
                </div>
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="ghost"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !documentType || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Uploaded Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{document.fileName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {document.documentType}
                        </Badge>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>•</span>
                        <span>{format(document.uploadDate, 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {(document.fileType.startsWith('image/') || document.fileType === 'application/pdf') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => previewDocument(document)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadDocument(document)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{document.fileName}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onRemove(document.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};