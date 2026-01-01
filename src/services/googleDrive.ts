/**
 * Google Drive Service
 * Handles authentication, file upload/download, and folder management
 * Uses Google Drive API v3 with drive.file scope (privacy-safe)
 */

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const APP_FOLDER_NAME = 'Budget App Documents';

// Drive scopes
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

interface DriveFile {
    id: string;
    name: string;
    webViewLink?: string;
    thumbnailLink?: string;
    mimeType: string;
    size: string;
    createdTime: string;
}

interface UploadResult {
    fileId: string;
    webViewLink?: string;
    thumbnailLink?: string;
    fileName: string;
    fileSize: number;
}

/**
 * Get Drive access token from user profile or initiate OAuth
 */
export async function getDriveToken(): Promise<string | null> {
    // TODO: Get from ProfileContext/Supabase
    // For now, return from sessionStorage (will be updated)
    return sessionStorage.getItem('google_drive_token');
}

/**
 * Save Drive token to user profile
 */
export async function saveDriveToken(token: string): Promise<void> {
    // TODO: Save to Supabase user_profiles
    sessionStorage.setItem('google_drive_token', token);
}

/**
 * Check if Drive is connected
 */
export async function isDriveConnected(): Promise<boolean> {
    const token = await getDriveToken();
    return !!token;
}

/**
 * Initiate Google Drive OAuth flow
 * Returns the OAuth URL to redirect to
 */
export function getGoogleDriveAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: DRIVE_SCOPE, // FIXED: Add Drive scope!
        prompt: 'consent',
        include_granted_scopes: 'true',
        state: 'drive_auth',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Extract access token from OAuth redirect
 */
export function extractTokenFromUrl(): string | null {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

/**
 * Get or create the main app folder in Drive
 */
export async function getOrCreateAppFolder(): Promise<string> {
    const token = await getDriveToken();
    if (!token) throw new Error('Drive not connected');

    // Search for existing folder
    const searchUrl = `${DRIVE_API_BASE}/files?` + new URLSearchParams({
        q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
    });

    const searchResponse = await fetch(searchUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!searchResponse.ok) {
        throw new Error('Failed to search for app folder');
    }

    const searchData = await searchResponse.json();

    // If folder exists, return its ID
    if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
    }

    // Create new folder
    const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: APP_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
        }),
    });

    if (!createResponse.ok) {
        throw new Error('Failed to create app folder');
    }

    const createData = await createResponse.json();
    return createData.id;
}

/**
 * Create a category subfolder (e.g., "Mutual Funds", "Tax Documents")
 */
export async function createCategoryFolder(category: string): Promise<string> {
    const token = await getDriveToken();
    if (!token) throw new Error('Drive not connected');

    const appFolderId = await getOrCreateAppFolder();

    // Search for existing category folder
    const searchUrl = `${DRIVE_API_BASE}/files?` + new URLSearchParams({
        q: `name='${category}' and '${appFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
    });

    const searchResponse = await fetch(searchUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!searchResponse.ok) {
        throw new Error('Failed to search for category folder');
    }

    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
    }

    // Create category folder
    const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: category,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [appFolderId],
        }),
    });

    if (!createResponse.ok) {
        throw new Error('Failed to create category folder');
    }

    const createData = await createResponse.json();
    return createData.id;
}

/**
 * Upload file to Google Drive
 */
export async function uploadFileToDrive(
    file: File,
    category: string,
    metadata?: { documentType?: string; description?: string }
): Promise<UploadResult> {
    const token = await getDriveToken();
    if (!token) throw new Error('Drive not connected');

    // Get category folder ID
    const folderId = await createCategoryFolder(category);

    // Create multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileMetadata = {
        name: file.name,
        parents: [folderId],
        description: metadata?.description || `${metadata?.documentType || 'Document'} - Uploaded from Budget App`,
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        `Content-Type: ${file.type}\r\n\r\n`;

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to read file'));

        reader.onload = async () => {
            const fileContent = reader.result;

            const multipartBody = new Blob([
                multipartRequestBody,
                fileContent as ArrayBuffer,
                closeDelimiter
            ]);

            try {
                const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink,size`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': `multipart/related; boundary=${boundary}`,
                    },
                    body: multipartBody,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`Drive upload failed: ${error.error?.message || 'Unknown error'}`);
                }

                const data = await response.json();

                resolve({
                    fileId: data.id,
                    webViewLink: data.webViewLink,
                    thumbnailLink: data.thumbnailLink,
                    fileName: file.name,
                    fileSize: file.size,
                });
            } catch (error) {
                reject(error);
            }
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Download file from Drive
 */
export async function downloadFileFromDrive(fileId: string): Promise<Blob> {
    const token = await getDriveToken();
    if (!token) throw new Error('Drive not connected');

    const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to download file from Drive');
    }

    return response.blob();
}

/**
 * Delete file from Drive
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
    const token = await getDriveToken();
    if (!token) throw new Error('Drive not connected');

    const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete file from Drive');
    }
}

/**
 * List files in a folder
 */
export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
    const token = await getDriveToken();
    if (!token) throw new Error('Drive not connected');

    const url = `${DRIVE_API_BASE}/files?` + new URLSearchParams({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, webViewLink, thumbnailLink, mimeType, size, createdTime)',
        orderBy: 'createdTime desc',
    });

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to list files');
    }

    const data = await response.json();
    return data.files || [];
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<DriveFile> {
    const token = await getDriveToken();
    if (!token) throw new Error('Drive not connected');

    const url = `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,webViewLink,thumbnailLink,mimeType,size,createdTime`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get file metadata');
    }

    return response.json();
}

/**
 * Revoke Drive access
 */
export async function disconnectDrive(): Promise<void> {
    const token = await getDriveToken();
    if (token) {
        // Revoke token
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: 'POST',
        });

        // Clear from storage
        sessionStorage.removeItem('google_drive_token');
        // TODO: Clear from Supabase user_profiles
    }
}
