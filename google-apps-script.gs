/**
 * Backend Google Apps Script pour la page "Դիմավորենք Արսենի 50-ամյակը".
 *
 * Ce script doit être collé dans l'éditeur Apps Script d'un Google Sheet
 * (Extensions → Apps Script), puis déployé comme "Application Web".
 * Voir README.md pour les instructions pas à pas.
 */

var SHEET_NAME = 'Responses';
var COLUMNS = ['family', 'guestCount', 'salad', 'main', 'side', 'dessert', 'ts'];

function doGet(e) {
  var action = e.parameter.action;
  var sheet = getSheet_();

  if (action === 'get') {
    var record = findRecord_(sheet, e.parameter.family);
    return jsonResponse_({ record: record });
  }

  if (action === 'list') {
    return jsonResponse_({ records: getAllRecords_(sheet) });
  }

  return jsonResponse_({ error: 'unknown action' });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = getSheet_();
  upsertRecord_(sheet, data);
  return jsonResponse_({ ok: true });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

function findRecord_(sheet, family) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === family) {
      return rowToRecord_(rows[i]);
    }
  }
  return null;
}

function getAllRecords_(sheet) {
  var rows = sheet.getDataRange().getValues();
  var records = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) records.push(rowToRecord_(rows[i]));
  }
  return records;
}

function rowToRecord_(row) {
  return {
    family: row[0],
    guestCount: row[1],
    salad: safeParse_(row[2]),
    main: safeParse_(row[3]),
    side: safeParse_(row[4]),
    dessert: safeParse_(row[5]),
    ts: row[6]
  };
}

function safeParse_(value) {
  try { return JSON.parse(value || '{}'); } catch (e) { return {}; }
}

function upsertRecord_(sheet, data) {
  var rows = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.family) { rowIndex = i + 1; break; }
  }

  var rowData = [
    data.family,
    data.guestCount,
    JSON.stringify(data.salad || {}),
    JSON.stringify(data.main || {}),
    JSON.stringify(data.side || {}),
    JSON.stringify(data.dessert || {}),
    data.ts || new Date().toISOString()
  ];

  if (rowIndex === -1) {
    sheet.appendRow(rowData);
  } else {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
