import { Laporan, LaporanKeterangan, Santri } from '../types';

// Paste your Apps Script Web App URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVWO8R_AFvIEMTRPCNLoFBBVLHtDczUsNoNB-m71ab9n8JDvSYuLDFj6smvMFCb6E2/exec';

async function safeJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Server returned non-JSON response:', text);
    throw new Error(`Server response is not valid JSON. First few characters: ${text.substring(0, 50)}`);
  }
}

export async function fetchAllData() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.warn('Apps Script URL is not configured. Using mock data.');
    return null;
  }
  
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'fetchAllData' })
    });
    
    if (!response.ok) {
       return { status: 'error', message: `HTTP Error ${response.status}: ${response.statusText}` };
    }

    const result = await safeJson(response);
    if (!result) return { status: 'error', message: 'Server returned empty response' };
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    return { status: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}

export async function submitLaporan(laporan: Laporan) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.warn('Apps Script URL is not configured. Mock submission.');
    return { status: 'success' };
  }

  try {
    console.log('Submitting laporan:', laporan);
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'submitLaporan',
        ...laporan
      })
    });
    const result = await safeJson(response);
    console.log('Submission result:', result);
    return result;
  } catch (error) {
    console.error('Error submitting laporan:', error);
    throw error;
  }
}

export async function saveSantri(santri: Santri) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.warn('Apps Script URL is not configured.');
    return { status: 'success' };
  }

  try {
    console.log('Saving santri:', santri);
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'saveSantri',
        ...santri
      })
    });
    const result = await safeJson(response);
    console.log('Save santri result:', result);
    return result;
  } catch (error) {
    console.error('Error saving santri:', error);
    throw error;
  }
}

export async function deleteSantriApi(id_santri: string) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.warn('Apps Script URL is not configured.');
    return { status: 'success' };
  }

  try {
    console.log('Deleting santri ID:', id_santri);
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'deleteSantri',
        id_santri
      })
    });
    const result = await safeJson(response);
    console.log('Delete santri result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting santri:', error);
    throw error;
  }
}

export async function login(username: string, password: string) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.warn('Apps Script URL is not configured. Mock login.');
    return { status: 'success', user: { username, role: 'admin' } };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'login',
        username,
        password
      })
    });
    return await safeJson(response);
  } catch (error) {
    console.error('Error in login:', error);
    throw error;
  }
}

export async function submitLaporanKeterangan(laporanKeterangan: LaporanKeterangan) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.warn('Apps Script URL is not configured. Mock submission.');
    return { status: 'success' };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'submitLaporanKeterangan',
        ...laporanKeterangan
      })
    });
    return await safeJson(response);
  } catch (error) {
    console.error('Error submitting laporan keterangan:', error);
    throw error;
  }
}

export async function deleteReport(id_santri: string, tanggal_laporan: string) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.warn('Apps Script URL is not configured.');
    return { status: 'success' };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'deleteReport',
        id_santri,
        tanggal_laporan
      })
    });
    return await safeJson(response);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}
