/**
 * Backend Google Apps Script pour la page "Դիմավորենք Արսենի 50-ամյակը".
 *
 * Ce script doit être collé dans l'éditeur Apps Script d'un Google Sheet
 * (Extensions → Apps Script), puis déployé comme "Application Web".
 * Voir README.md pour les instructions pas à pas.
 *
 * Chaque restaurant a son propre onglet ("Responses – <nom>"), en tableau :
 * une ligne par famille, une colonne par plat (la quantité choisie),
 * regroupées par catégorie sous deux lignes d'en-tête. Aucune donnée JSON
 * brute n'est stockée dans les cellules — tout est directement lisible (et
 * sommable) dans le Sheet.
 */

var HEADER_VERSION = 'v3-restaurants';
var FIXED_COLUMNS = ['Ընտանիք', 'Հյուրերի թիվ', 'Ամսաթիվ'];
var DATA_START_ROW = 3;

// Doit rester identique (mêmes id/clés/plats) à RESTAURANTS dans index.html.
var RESTAURANTS = {
  livingston: {
    sheetName: 'Responses – Livingston',
    categories: [
      {
        key: 'salad',
        title: 'ԱՂՑԱՆՆԵՐ',
        items: [
          'Ռոստբիֆ վարունգով և թայլանդական սոուսով',
          'Հավի կրծքամիս Լ’Օրանժ',
          'Բիֆ օբերժին',
          'Բադի ֆիլե լոռամրգի սոուսով'
        ]
      },
      {
        key: 'main',
        title: 'ՏԱՔ ՈՒՏԵՍՏՆԵՐ',
        items: [
          'Հավի ճուտ հաճարի ռիզոտտոյով',
          'Սիգ մուսլին էսպումայով',
          'Օձաձկով և ստրաչատելլայով',
          'Թունայով և ավոկադոյով',
          'Գառան թիակ պակ չոյով',
          'Ֆիլե մինյոն ֆրենչ գարդեն խյուսով',
          'Իշխանի ֆիլե մուեր սնկով և քունջութի սոուսով'
        ]
      },
      {
        key: 'side',
        title: 'ԽԱՎԱՐՏՆԵՐ',
        items: [
          'Կանարյան կարտոֆիլ',
          'Պոմ պյուրե',
          'Գրիլ բանջարեղեն',
          'Վայրի բրինձ',
          'Հավի ճուտ',
          'Խոզի չալաղաջ'
        ]
      }
    ]
  },
  malkhas: {
    sheetName: 'Responses – Malkhas Jazz Club',
    categories: [
      {
        key: 'salad',
        title: 'ՍԱՌԸ ՆԱԽՈՒՏԵՍՏՆԵՐ',
        items: [
          'Պանրերի սկուտեղ',
          'Ձիթապտուղների սկուտեղ',
          'Հացի զամբյուղ'
        ]
      },
      {
        key: 'main',
        title: 'ՏԱՔ ՈՒՏԵՍՏՆԵՐ',
        items: [
          'Ստեյք',
          'Փաստա',
          'Խոզի կողիկ'
        ]
      }
    ]
  }
};

function doGet(e) {
  var restaurant = getRestaurant_(e.parameter.restaurant);
  if (!restaurant) return jsonResponse_({ error: 'unknown restaurant' });

  var action = e.parameter.action;
  var sheet = getSheet_(restaurant);

  if (action === 'get') {
    return jsonResponse_({ record: findRecord_(sheet, restaurant, e.parameter.family) });
  }

  if (action === 'list') {
    return jsonResponse_({ records: getAllRecords_(sheet, restaurant) });
  }

  return jsonResponse_({ error: 'unknown action' });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var restaurant = getRestaurant_(data.restaurant);
  if (!restaurant) return jsonResponse_({ error: 'unknown restaurant' });

  upsertRecord_(getSheet_(restaurant), restaurant, data);
  return jsonResponse_({ ok: true });
}

function getRestaurant_(id) {
  return RESTAURANTS.hasOwnProperty(id) ? RESTAURANTS[id] : null;
}

function getDishColumns_(restaurant) {
  var cols = [];
  restaurant.categories.forEach(function (cat) {
    cat.items.forEach(function (name) {
      cols.push({ category: cat.key, name: name });
    });
  });
  return cols;
}

function getSheet_(restaurant) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(restaurant.sheetName);
  if (!sheet) sheet = ss.insertSheet(restaurant.sheetName);
  ensureHeaders_(sheet, restaurant);
  return sheet;
}

/**
 * (Re)builds the two-row header (category title + dish name per column) the
 * first time it sees a sheet that doesn't already carry this exact layout.
 * This also runs automatically the first time the updated script is used
 * against an older sheet — which clears out whatever was there before, so
 * back up anything you want to keep before that happens.
 */
function ensureHeaders_(sheet, restaurant) {
  if (sheet.getRange(1, 1).getNote() === HEADER_VERSION) return;

  var dishColumns = getDishColumns_(restaurant);
  var totalCols = FIXED_COLUMNS.length + dishColumns.length;

  sheet.clear();

  var row2 = FIXED_COLUMNS.map(function () { return ''; })
    .concat(dishColumns.map(function (d) { return d.name; }));
  sheet.getRange(2, 1, 1, totalCols).setValues([row2]);

  var col = FIXED_COLUMNS.length + 1;
  restaurant.categories.forEach(function (cat) {
    var span = cat.items.length;
    sheet.getRange(1, col, 1, span).merge().setValue(cat.title);
    col += span;
  });

  FIXED_COLUMNS.forEach(function (label, i) {
    sheet.getRange(1, i + 1, 2, 1).merge().setValue(label);
  });

  sheet.getRange(1, 1, 2, totalCols)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true)
    .setBackground('#F3EEE3');

  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(FIXED_COLUMNS.length);
  sheet.setColumnWidths(FIXED_COLUMNS.length + 1, dishColumns.length, 90);

  sheet.getRange(1, 1).setNote(HEADER_VERSION);
}

function findRowIndex_(sheet, family) {
  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) return -1;

  var families = sheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, 1).getValues();
  for (var i = 0; i < families.length; i++) {
    if (families[i][0] === family) return DATA_START_ROW + i;
  }
  return -1;
}

function rowToRecord_(sheet, rowIndex, restaurant, dishColumns) {
  var totalCols = FIXED_COLUMNS.length + dishColumns.length;
  var values = sheet.getRange(rowIndex, 1, 1, totalCols).getValues()[0];

  var record = { family: values[0], guestCount: values[1], ts: values[2] };
  restaurant.categories.forEach(function (cat) { record[cat.key] = {}; });

  dishColumns.forEach(function (d, i) {
    var qty = values[FIXED_COLUMNS.length + i];
    if (qty) record[d.category][d.name] = qty;
  });

  return record;
}

function findRecord_(sheet, restaurant, family) {
  var rowIndex = findRowIndex_(sheet, family);
  if (rowIndex === -1) return null;
  return rowToRecord_(sheet, rowIndex, restaurant, getDishColumns_(restaurant));
}

function getAllRecords_(sheet, restaurant) {
  var dishColumns = getDishColumns_(restaurant);
  var lastRow = sheet.getLastRow();
  var records = [];
  for (var r = DATA_START_ROW; r <= lastRow; r++) {
    if (sheet.getRange(r, 1).getValue()) records.push(rowToRecord_(sheet, r, restaurant, dishColumns));
  }
  return records;
}

function upsertRecord_(sheet, restaurant, data) {
  var dishColumns = getDishColumns_(restaurant);
  var totalCols = FIXED_COLUMNS.length + dishColumns.length;

  var row = [data.family, data.guestCount, data.ts || new Date().toISOString()];
  dishColumns.forEach(function (d) {
    var sel = data[d.category] || {};
    row.push(sel[d.name] || 0);
  });

  var rowIndex = findRowIndex_(sheet, data.family);
  if (rowIndex === -1) rowIndex = Math.max(sheet.getLastRow() + 1, DATA_START_ROW);

  sheet.getRange(rowIndex, 1, 1, totalCols).setValues([row]);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
