import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required Google Workspace scopes
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Try to get token from session/local if cached in memory is lost (on page refresh)
      const storedToken = sessionStorage.getItem('g_sheets_token');
      if (storedToken) {
        cachedAccessToken = storedToken;
      }
      
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      sessionStorage.removeItem('g_sheets_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google (Interactive)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    // Cache inside sessionStorage to persist across temporary page loads/refreshes safely
    sessionStorage.setItem('g_sheets_token', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    cachedAccessToken = sessionStorage.getItem('g_sheets_token');
  }
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  sessionStorage.removeItem('g_sheets_token');
};

// ==========================================
// DIRECT GOOGLE SHEETS API UTILITIES
// ==========================================

export interface SheetsResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

const HEADERS = [
  "Waktu Input/Sync", 
  "NISN", 
  "Nama Lengkap", 
  "Gender (L/P)", 
  "Kelas", 
  "Tempat Lahir", 
  "Tanggal Lahir", 
  "Nama Wali", 
  "Kontak Wali",
  "Status Siswa"
];

/**
 * Create a brand new Google Spreadsheet and write headers to Sheet1
 */
export const createNewSpreadsheet = async (accessToken: string, title: string): Promise<SheetsResponse> => {
  try {
    // 1. Create Spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: title
        }
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Gagal membuat spreadsheet: ${errText}`);
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // 2. Add Headers to Sheet1
    await writeHeadersToSpreadsheet(accessToken, spreadsheetId);

    return { spreadsheetId, spreadsheetUrl };
  } catch (err: any) {
    console.error('createNewSpreadsheet error:', err);
    throw err;
  }
};

/**
 * Writes or checks the headers in the spreadsheet
 */
export const writeHeadersToSpreadsheet = async (accessToken: string, spreadsheetId: string): Promise<void> => {
  const range = 'Sheet1!A1:J1';
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [HEADERS]
    })
  });
};

/**
 * Append students into Google Spreadsheet directly (Client-side)
 */
export const appendStudentsToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  students: Student[]
): Promise<void> => {
  try {
    // First, verify we can write headers or let them be created if needed
    await writeHeadersToSpreadsheet(accessToken, spreadsheetId);

    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const rows = students.map(student => [
      timestamp,
      student.nisn || "",
      student.nama || "",
      student.gender || "",
      student.kelas || "",
      student.tempatLahir || "",
      student.tanggalLahir || "",
      student.namaWali || "",
      student.teleponWali || "",
      student.status || ""
    ]);

    const range = 'Sheet1!A:J';
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: rows
        })
      }
    );

    if (!appendRes.ok) {
      const errText = await appendRes.text();
      throw new Error(`Gagal menambahkan baris: ${errText}`);
    }
  } catch (err: any) {
    console.error('appendStudentsToSpreadsheet error:', err);
    throw err;
  }
};

/**
 * Test reading spreadsheet info to check authorization and ID validity
 */
export const testSpreadsheetConnection = async (accessToken: string, spreadsheetId: string): Promise<boolean> => {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return res.ok;
  } catch (err) {
    console.error('testSpreadsheetConnection error:', err);
    return false;
  }
};
