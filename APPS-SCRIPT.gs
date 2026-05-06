/**
 * GOOGLE APPS SCRIPT DATABASE HANDLER
 * Salin kode ini ke Editor Apps Script Anda (script.google.com)
 * Pastikan nama sheet sesuai dengan yang ada di kode ini (santri, rombel, desa, kelompok, materi, laporan)
 */

// Paste your Spreadsheet ID here if the script is NOT bound to a spreadsheet
const FALLBACK_SPREADSHEET_ID = ''; 

function getSpreadsheetId() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getId();
  } catch (e) {
    if (FALLBACK_SPREADSHEET_ID) return FALLBACK_SPREADSHEET_ID;
    throw new Error('Spreadsheet tidak ditemukan. Hubungkan script ke spreadsheet atau isi FALLBACK_SPREADSHEET_ID.');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.openById(getSpreadsheetId());
    
    let result = { status: 'error', message: 'Action not found' };

    if (action === 'fetchAllData') {
      result = fetchAllData(ss);
    } else if (action === 'login') {
      result = loginUser(ss, data);
    } else if (action === 'submitLaporan') {
      result = submitLaporan(ss, data);
    } else if (action === 'submitLaporanKeterangan') {
      result = submitLaporanKeterangan(ss, data);
    } else if (action === 'saveSantri') {
      result = saveSantri(ss, data);
    } else if (action === 'deleteSantri') {
      result = deleteSantri(ss, data);
    } else if (action === 'deleteReport') {
      result = deleteReport(ss, data);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Untuk pengetesan koneksi via browser
  return ContentService.createTextOutput("Apps Script is running. Use POST for data operations.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function fetchAllData(ss) {
  return {
    status: 'success',
    santri: getSheetData(ss, 'santri'),
    rombel: getSheetData(ss, 'rombel'),
    desa: getSheetData(ss, 'desa'),
    kelompok: getSheetData(ss, 'kelompok'),
    materi: getSheetData(ss, 'materi'),
    target: getSheetData(ss, 'target'),
    laporan: getSheetData(ss, 'laporan'),
    laporan_keterangan: getSheetData(ss, 'laporan_keterangan'),
    keterangan: getSheetData(ss, 'keterangan')
  };
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
      }
      obj[header] = val;
    });
    return obj;
  });
}

function saveSantri(ss, data) {
  const lock = LockService.getScriptLock();
  try {
    // Tunggu maksimal 30 detik untuk mendapatkan akses eksklusif
    lock.waitLock(30000);
    
    const sheet = ss.getSheetByName('santri');
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idIndex = headers.indexOf('id_santri');
    
    let rowIndex = -1;
    const isNew = data.id_santri.startsWith('NEW-');
    
    if (!isNew) {
      for (let i = 1; i < values.length; i++) {
        if (values[i][idIndex] == data.id_santri) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    const rowData = headers.map(h => data[h] || "");
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
    } else {
      if (isNew) rowData[idIndex] = "S" + Date.now();
      sheet.appendRow(rowData);
    }
    
    return { status: 'success', message: 'Data santri berhasil disimpan' };
  } catch (e) {
    return { status: 'error', message: 'Gagal mendapatkan akses database (Sistem sibuk): ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deleteSantri(ss, data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const sheet = ss.getSheetByName('santri');
    const values = sheet.getDataRange().getValues();
    const idIndex = values[0].indexOf('id_santri');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] == data.id_santri) {
        sheet.deleteRow(i + 1);
        return { status: 'success', message: 'Santri berhasil dihapus' };
      }
    }
    return { status: 'error', message: 'ID Santri tidak ditemukan' };
  } catch (e) {
    return { status: 'error', message: 'Gagal mengakses database: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function submitLaporan(ss, data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const sheet = ss.getSheetByName('laporan');
    const headers = sheet.getDataRange().getValues()[0];
    const rowData = headers.map(h => data[h] || "");
    sheet.appendRow(rowData);
    return { status: 'success' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function submitLaporanKeterangan(ss, data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const sheet = ss.getSheetByName('laporan_keterangan');
    if (!sheet) return { status: 'error', message: 'Sheet laporan_keterangan tidak ditemukan' };
    const headers = sheet.getDataRange().getValues()[0];
    const rowData = headers.map(h => data[h] || "");
    sheet.appendRow(rowData);
    return { status: 'success' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function deleteReport(ss, data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    
    // 1. Delete from 'laporan' sheet
    const sheetLaporan = ss.getSheetByName('laporan');
    if (sheetLaporan) {
      const values = sheetLaporan.getDataRange().getValues();
      const headers = values[0];
      const santriIdx = headers.indexOf('id_santri');
      const tglIdx = headers.indexOf('tanggal_laporan');
      const lkIdx = headers.indexOf('id_laporanketerangan');
      
      let lkIdsToDelete = [];
      
      for (let i = values.length - 1; i >= 1; i--) {
        const rowDate = values[i][tglIdx] instanceof Date ? 
                        Utilities.formatDate(values[i][tglIdx], ss.getSpreadsheetTimeZone(), "yyyy-MM-dd") : 
                        values[i][tglIdx];
                        
        if (values[i][santriIdx] == data.id_santri && rowDate == data.tanggal_laporan) {
          if (lkIdx !== -1 && values[i][lkIdx]) {
            lkIdsToDelete.push(values[i][lkIdx]);
          }
          sheetLaporan.deleteRow(i + 1);
        }
      }
      
      // 2. Delete from 'laporan_keterangan' sheet
      if (lkIdsToDelete.length > 0) {
        const sheetKet = ss.getSheetByName('laporan_keterangan');
        if (sheetKet) {
          const ketValues = sheetKet.getDataRange().getValues();
          const ketHeaders = ketValues[0];
          const ketLkIdx = ketHeaders.indexOf('id_laporanketerangan');
          
          if (ketLkIdx !== -1) {
            for (let j = ketValues.length - 1; j >= 1; j--) {
              if (lkIdsToDelete.indexOf(ketValues[j][ketLkIdx]) !== -1) {
                sheetKet.deleteRow(j + 1);
              }
            }
          }
        }
      }
    }
    
    return { status: 'success', message: 'Laporan berhasil dihapus' };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function loginUser(ss, data) {
  // Try both 'users' and 'user' sheet names
  let sheet = ss.getSheetByName('users');
  if (!sheet) sheet = ss.getSheetByName('user');
  
  const usernameInput = data.username ? data.username.toString().trim() : "";
  const passwordInput = data.password ? data.password.toString().trim() : "";

  if (sheet) {
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(h => h.toString().toLowerCase().trim());
    
    const userIndex = headers.indexOf('username');
    const passIndex = headers.indexOf('password');
    // Check for common name variations if 'nama_user' is not found
    let nameIndex = headers.indexOf('nama_user');
    if (nameIndex === -1) nameIndex = headers.indexOf('nama');
    if (nameIndex === -1) nameIndex = headers.indexOf('name');
    
    if (userIndex === -1) return { status: 'error', message: 'Kolom "username" tidak ditemukan di sheet users' };

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[userIndex].toString().trim() == usernameInput) {
        // Simple password check if password column exists
        if (passIndex !== -1 && row[passIndex].toString().trim() != passwordInput) {
          continue;
        }
        
        let userObj = {};
        const originalHeaders = values[0];
        originalHeaders.forEach((header, j) => {
          userObj[header] = row[j];
        });

        // Ensure the frontend gets the fields it expects
        if (!userObj.nama_user && nameIndex !== -1) {
          userObj.nama_user = row[nameIndex];
        }
        if (!userObj.id_user) userObj.id_user = "U" + i;
        if (!userObj.role) userObj.role = 'admin';

        return { status: 'success', user: userObj };
      }
    }
    return { status: 'error', message: 'Username atau Password tidak cocok' };
  }

  // Fallback Mock Logic (Jika sheet 'users' atau 'user' belum dibuat)
  const username = usernameInput || "User";
  const mockNames = {
    'admin': 'Administrator Pusat',
    'budi': 'H. Budi Santoso',
    'ani': 'Siti Anisyah'
  };

  const displayName = mockNames[username.toLowerCase()] || (username.charAt(0).toUpperCase() + username.slice(1));

  return { 
    status: 'success', 
    user: {
      id_user: "U1",
      username: username,
      nama_user: displayName, 
      role: 'admin',
      id_kelompok: 'k1',
      id_desa: 'd1'
    }
  };
}
