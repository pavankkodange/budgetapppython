import React, { useState, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DocumentAttachment } from '@/types';
import { Upload, FileText, Trash2, Download, Eye, ExternalLink, Cloud, AlertCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
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
import { isDriveConnected, uploadFileToDrive, deleteFileFromDrive, downloadFileFromDrive } from '@/services/googleDrive';

interface DocumentUploadProps {
  documents: DocumentAttachment[];
  onUpload: (document: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
  onRemove: (documentId: string) => void;
  category?: string;
}

const documentTypes = [
  'Policy Document',
  'Premium Receipt',
  'Claim Form',
  'Medical Reports',
  'Tax Document',
  'Invoice',
  'Receipt',
  'Other'
];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onUpload,
  onRemove,
  category = 'Documents',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [checkingDrive, setCheckingDrive] = useState(true);

  useEffect(() => {
    checkDriveConnection();
  }, []);

  const checkDriveConnection = async () => {
    setCheckingDrive(true);
    try {
      const connected = await isDriveConnected();
      setDriveConnected(connected);
    } catch (error) {
      console.error('Error checking Drive connection:', error);
    } finally {
      setCheckingDrive(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        showError('File size must be less than 100MB');
        return;
      }

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

    if (!driveConnected) {
      showError('Please connect Google Drive first');
      return;
    }

    setUploading(true);

    try {
      const result = await uploadFileToDrive(selectedFile, category, {
        documentType,
        description: `${documentType} - ${category}`,
      });

      const documentData: Omit<DocumentAttachment, 'id' | 'uploadDate'> = {
        fileName: result.fileName,
        fileType: selectedFile.type,
        fileSize: result.fileSize,
        documentType: documentType,
        driveFileId: result.fileId,
        driveWebViewLink: result.webViewLink,
        driveThumbnailLink: result.thumbnailLink,
        driveFolder: category,
      };

      onUpload(documentData);
      setSelectedFile(null);
      setDocumentType('');

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      showSuccess(`✅ ${result.fileName} uploaded to Google Drive!`);
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload to Google Drive. Please try again.');
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

  const downloadDocument = async (doc: DocumentAttachment) => {
    if (doc.driveFileId) {
      try {
        const blob = await downloadFileFromDrive(doc.driveFileId);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download file from Drive');
      }
    } else if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewDocument = (doc: DocumentAttachment) => {
    if (doc.driveWebViewLink) {
      window.open(doc.driveWebViewLink, '_blank');
      return;
    }

    if (!doc.fileData) {
      showError('No preview available for this document');
      return;
    }

    const newWindow = window.open();
    if (!newWindow) {
      showError('Popup blocked. Please allow popups to preview documents.');
      return;
    }

    try {
      if (doc.fileType.startsWith('image/')) {
        newWindow.document.write(`
          <html>
            <head><title>${doc.fileName}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a1a;">
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
    } catch (error) {
      console.error('Preview error:', error);
      showError('Failed to preview document');
      newWindow.close();
    }
  };

  const handleRemove = async (doc: DocumentAttachment) => {
    if (doc.driveFileId) {
      try {
        await deleteFileFromDrive(doc.driveFileId);
        showSuccess('File removed from Google Drive');
      } catch (error) {
        console.error('Error deleting from Drive:', error);
      }
    }
    onRemove(doc.id);
  };

  return (
    <div className="space-y-6">
      {!checkingDrive && !driveConnected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Google Drive Not Connected</AlertTitle>
          <AlertDescription>
            Connect your Google Drive in Settings to upload documents with unlimited storage.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload Documents
            {driveConnected && <Badge variant="outline" className="ml-2"><Cloud className="h-3 w-3 mr-1" /> Drive Connected</Badge>}
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
                disabled={!driveConnected || uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported: PDF, Word, JPEG, PNG (max 100MB)
              </p>
            </div>

            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select onValueChange={setDocumentType} value={documentType} disabled={!driveConnected || uploading}>
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
                <Button onClick={() => setSelectedFile(null)} variant="ghost" size="sm" disabled={uploading}>
                  Remove
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !documentType || uploading || !driveConnected}
            className="w-full"
          >
            {uploading ? 'Uploading to Drive...' : 'Upload to Google Drive'}
          </Button>

          {!driveConnected && (
            <p className="text-xs text-center text-muted-foreground">
              💡 Connect Google Drive in Settings to enable document uploads
            </p>
          )}
        </CardContent>
      </Card>

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
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{document.fileName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{document.documentType}</Badge>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>•</span>
                        <span>{format(document.uploadDate, 'dd MMM yyyy')}</span>
                        {document.driveFileId && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              <Cloud className="h-3 w-3 mr-1" />
                              Drive
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {(document.driveWebViewLink || (document.fileData && (document.fileType.startsWith('image/') || document.fileType === 'application/pdf'))) && (
                      <Button variant="ghost" size="icon" onClick={() => previewDocument(document)} title="Preview">
                        {document.driveWebViewLink ? <ExternalLink className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}

                    <Button variant="ghost" size="icon" onClick={() => downloadDocument(document)} title="Download">
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
                            Are you sure you want to delete "{document.fileName}"?
                            {document.driveFileId && ' This will also remove it from Google Drive.'}
                            {' This action cannot be undone.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemove(document)}
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