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

interface IncomeDocumentUploadProps {
    documents: DocumentAttachment[];
    onUpload: (document: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
    onRemove: (documentId: string) => void;
}

const documentTypes = [
    'Paystub',
    'Tax Form',
    'Receipt',
    'Invoice',
    'Contract',
    'Other'
];

export const IncomeDocumentUpload: React.FC<IncomeDocumentUploadProps> = ({
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
                setUploading(false);
                showSuccess('Document uploaded successfully');

                // Reset file input
                const fileInput = document.getElementById('income-file-upload') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
            };
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            showError('Failed to upload document');
            setUploading(false);
        }
    };

    const handleDownload = (doc: DocumentAttachment) => {
        if (doc.fileData) {
            const link = document.createElement('a');
            link.href = doc.fileData;
            link.download = doc.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handlePreview = (doc: DocumentAttachment) => {
        if (doc.fileData) {
            const newWindow = window.open();
            if (newWindow) {
                if (doc.fileType === 'application/pdf') {
                    newWindow.document.write(`<iframe src="${doc.fileData}" style="width:100%;height:100%;border:none;"></iframe>`);
                } else if (doc.fileType.startsWith('image/')) {
                    newWindow.document.write(`<img src="${doc.fileData}" style="max-width:100%;height:auto;" />`);
                } else {
                    handleDownload(doc);
                }
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Income Documents
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Section */}
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <div className="space-y-2">
                        <Label htmlFor="income-file-upload">Select File</Label>
                        <Input
                            id="income-file-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="cursor-pointer"
                        />
                        {selectedFile && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="document-type">Document Type</Label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger id="document-type">
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

                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || !documentType || uploading}
                        className="w-full"
                    >
                        {uploading ? (
                            <>
                                <Upload className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </>
                        )}
                    </Button>
                </div>

                {/* Documents List */}
                {documents.length > 0 ? (
                    <div className="space-y-2">
                        <Label>Uploaded Documents ({documents.length})</Label>
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{doc.fileName}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="secondary" className="text-xs">
                                                    {doc.documentType}
                                                </Badge>
                                                <span>{formatFileSize(doc.fileSize)}</span>
                                                <span>•</span>
                                                <span>{format(new Date(doc.uploadDate), 'PP')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handlePreview(doc)}
                                            title="Preview"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(doc)}
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
                                                    <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete {doc.fileName}? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onRemove(doc.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No documents uploaded yet
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
