/**
 * Backend Google Apps Script pour la page "Դիմավորենք Արսենի 50-ամյակը".
 *
 * Ce script doit être collé dans l'éditeur Apps Script d'un Google Sheet
 * (Extensions → Apps Script), puis déployé comme "Application Web".
 * Voir README.md pour les instructions pas à pas.
 *
 * Chaque restaurant a son propre onglet ("Responses – <nom>"), en tableau :
 * une colonne par famille, une ligne par plat (la quantité choisie),
 * regroupées par catégorie sous deux colonnes d'en-tête. Aucune donnée JSON
 * brute n'est stockée dans les cellules — tout est directement lisible (et
 * sommable) dans le Sheet. Il y a généralement bien plus de plats que de
 * familles, d'où ce sens (familles en colonnes, plats en lignes) plutôt que
 * l'inverse.
 */

var FIXED_ROWS = ['Ընտանիք', 'Հյուրերի թիվ', 'Ամսաթիվ'];
var DATA_START_COL = 3;

// Doit rester identique (mêmes id/clés/plats) à RESTAURANTS dans index.html.
// `version` ne change que quand les colonnes de CE restaurant changent
// (plat ajouté/retiré/renommé) — c'est ce qui force la reconstruction (et
// l'effacement) de son onglet uniquement, sans toucher aux autres.
var RESTAURANTS = {
  livingston: {
    version: 'v4-restaurants-transposed',
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
    version: 'v4-restaurants-transposed',
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
  },
  mezzo: {
    version: 'v6-mezzo-transposed',
    sheetName: 'Responses – Mezzo',
    categories: [
      {
        key: 'salad',
        title: 'ԱՂՑԱՆՆԵՐ',
        items: [
          'Կեսար՝ հավի կրծքամիսով',
          'Կեսար՝ ծովախեցգետնով',
          'Կեսար՝ սաղմոնով',
          'Հավով և սպանախով',
          'Հունական',
          'Պրովանսալ',
          'Նիսուազ',
          'Սաղմոնով աղցան',
          'Տաք աղցան',
          'Ծովախեցգետնով աղցան',
          'Բանջարեղենի գրիլ-աղցան',
          'Ուլունքային և սպանախով',
          'Կապրեզե'
        ]
      },
      {
        key: 'main',
        title: 'ՀԻՄՆԱԿԱՆ ՈՒՏԵՍՏՆԵՐ',
        items: [
          'Ռոստբիֆ',
          'Բիֆ Մեդալիոն',
          'Փորկի',
          'Հավ սերուցքային սոուսով',
          'Հավի Կրեմպանե պեստո սոուսով'
        ]
      },
      {
        key: 'steak',
        title: 'ՍԹԵՅՔ',
        items: [
          'Ֆիլե Մինյոն',
          'Փեփր Սթեյք',
          'Ռիբայ Բեֆ Անգուս',
          'Ռիբայ',
          'Տոմահոկ',
          'Դատան կատե',
          'Գրիլ ասորտի'
        ]
      },
      {
        key: 'side',
        title: 'ՊԱՍՏԱ ԵՎ ԽԱՎԱՐՏ',
        items: [
          'Սպագետի Բոլոնեզ',
          'Պեննե Կվատրո Ֆորմաջի',
          'Տալիատելե Մարինարա',
          'Կարբոնառա Ֆետուչինի',
          'Տապակած սունկ',
          'Կարտոֆիլ',
          'Բանջարեղեն',
          'Բրինձ',
          'Ծնեբեկ'
        ]
      }
    ]
  },
  lavash: {
    version: 'v5-lavash-transposed',
    sheetName: 'Responses – Lavash',
    categories: [
      {
        key: 'salad',
        title: 'ԱՂՑԱՆՆԵՐ',
        items: [
          'Լոլիկի և մոցարելլայի աղցան',
          'Բրոկոլիի և սնկի աղցան',
          'Ասիական աղցան',
          'Բուրատա պանիր կարամելացված մրգերով',
          'Ստրաչատելլա աղցան',
          'Կովսական աղցան',
          'Հունական աղցան',
          'Հունական աղցան խաղողով',
          'Սմբուկի աղցան թարխունի սոուսով',
          'Լցոնած սմբուկներ',
          'Վոլորան',
          'Միջօրե',
          'Կեսար աղցան',
          'Կեսար աղցան սաղմոնով',
          'Ավելուկ մածունով',
          'Ավելուկի աղցան',
          'Մոցարելլա մեղրի սոուսով և ճակնդեղով',
          'Միքս աղցան',
          'Ամառային աղցան',
          'Արևադարձային սիմֆոնիա',
          'Ստրաչատելլա ալ թոննո',
          'Էկզոտիկ բրեզաոլայի աղցան'
        ]
      },
      {
        key: 'main',
        title: 'ՀԻՄՆԱԿԱՆ ՈՒՏԵՍՏՆԵՐ',
        items: [
          'Հորթի ուս եփած հաճարի փլավով',
          'Թանդուրի խորովածի ափսե',
          'Հաճարի փլավ սնկով',
          'Գառան ուս հաճարի փլավով',
          'Գառան ուս (կտրատած)',
          'Քարահունջ',
          'Տավարի ստրոգանով սնկով',
          'Լավաշ',
          'Խուրջին',
          'Հորթի խաշլամա (նոր բաղադրատոմս)',
          'Ավան',
          'Հորթի կողեր կանաչ սոուսով',
          'Խոզի խորոված բանջարեղենով',
          'Էրզրումի ղափամա',
          'Ղափամա լավաշով',
          'Տավարի տժվժիկ',
          'Գառան տժվժիկ',
          'Թավա քյուֆթա',
          'Իշլի քյուֆթա սնկով',
          'Իշլի քյուֆթա',
          'Տապակած սունկ կարտոֆիլով',
          'Խորոված ոստրե սունկ',
          'Տապակած հավ',
          'Թոլմա խաղողի տերևով',
          'Թոլմա կաղամբի տերևով',
          'Խինկալի',
          'Տապակած խինկալի',
          'Պելմենի կանաչիով',
          'Տապակած պելմենի ձվով',
          'Պելմենի',
          'Ժենգյալով հաց',
          'Լցոնած դդում ծովախեցգետնով',
          'Մեդալիոններ սպանախով',
          'Սաղմոնի սթեյք ռոքֆորի սոուսով',
          'Շոգեխաշած իշխան',
          'Ջերմուկի կարմրախայտ շոգեխաշած',
          'Սաղմոն կիտրոնի սոուսով',
          'Լավաշով գավառական իշխան',
          'Խորոված իշխան',
          'Խորոված Սևանի սիգ',
          'Խորոված թառափ (ստերլետ)',
          'Խորոված թառափ (ստերլետ), 2 կտոր',
          'Խորոված խոզի մատ',
          'Խորոված խոզի կողեր',
          'Խորոված խոզի ֆիլե',
          'Խորոված խոզի պարանոց',
          'Խորոված տավարի ֆիլե',
          'Խորոված անգուսի կողեր',
          'Խորոված գառան մատ',
          'Խորոված հավ',
          'Խորոված տավարի սիրտ և լյարդ',
          'Գառան մշո քյաբաբ բուլղարական աղցանով',
          'Տավարի մշո քյաբաբ բուլղարական աղցանով',
          'Էրեբունի',
          'Խորոված կարտոֆիլ',
          'Խորոված սունկ',
          'Խորոված բանջարեղեն',
          'Խորոված պանիր'
        ]
      },
      {
        key: 'side',
        title: 'ԽԱՎԱՐՏՆԵՐ',
        items: [
          'Տապակած աղտոր',
          'Տապակած մանգաղախոտ',
          'Տապակած շուշան',
          'Տապակած կանաչ լոբի',
          'Կանաչ ոլոռ',
          'Արիշտա',
          'Բրինձ',
          'Հնդկացորեն',
          'Կարտոֆիլի պյուրե'
        ]
      }
    ]
  },
  kamancha: {
    version: 'v3-kamancha-transposed',
    sheetName: 'Responses – Kamancha',
    categories: [
      {
        key: 'salad',
        title: 'ԱՂՑԱՆՆԵՐ',
        items: [
          'Արտի աղցան',
          'Պղպեղանի',
          'Խրթխրթան աղցան',
          'Թարխունով և հորած պանրով (սեզոնային)',
          'Հավ քինոա',
          'Տավարի մսով և սմբուկով',
          'Ավելուկ',
          'Քամած մածուն վարունգով',
          'Թաբուլե',
          'Ամառային աղցան',
          'Կեսար աղցան',
          'Հունական աղցան'
        ]
      },
      {
        key: 'main',
        title: 'ՀԻՄՆԱԿԱՆ ՈՒՏԵՍՏՆԵՐ',
        items: [
          'Փիդե երկու միս',
          'Փիդե պեպերոնի',
          'Փիդե լահմաջո',
          'Փիդե պանրային',
          'Փիդե գառան մսով',
          'Պանրխաշ',
          'Խոզի շաուրմա խմորի մեջ',
          'Աջարական խաչապուրի',
          'Իմերեթական խաչապուրի',
          'Ամառային տոլմա',
          'Թփով տոլմա',
          'Կաղամբով տոլմա',
          'Տոլմա գառան մսով',
          'Տոլմայի տեսականի',
          'Գառնի յարախ',
          'Տժվժիկ',
          'Արիշտա գավուրմայով',
          'Տապակած կարտոֆիլ գավուրմայով',
          'Տնական շիլա հավով',
          'Թավա սուլուգունի',
          'Թավա կոտլետ պանրով',
          'Նրբերշիկների տեսականի',
          'Արիշտա բաժուկի ճավով',
          'Քյուֆթա սերուցքային սոուսով',
          'Խուրջին',
          'Խուրջին գառան մսով',
          'Քալագյոշ',
          'Տավարի խաշլամա',
          'Գառան խաշլամա',
          'Երևանյան տապակա արենի',
          'Սյունիքի խաշնթուր',
          'Լցոնված չալաղաջ Եղեգնաձոր',
          'Նազելի',
          'Արիշտա գառան գավուրմայով',
          'Տապակած կարտոֆիլ գառան գավուրմայով',
          'Տավարի ֆիլե',
          'Հավի փափկամիս',
          'Խոզի բեկոն',
          'Իշխանի ֆիլե',
          'Գառան չալաղաջ',
          'Բանջարեղենային',
          'Խորոված խոզի չալաղաջ',
          'Խորոված խոզի մատներ',
          'Խորոված խոզի փափկամիս',
          'Խորոված տավարի ֆիլե',
          'Խորոված գառան չալաղաջ',
          'Խորոված գառան փափկամիս',
          'Խորոված գառան մատներ',
          'Խորոված հավ',
          'Տավարի քաբաբ',
          'Հավի քաբաբ',
          'Գառան քաբաբ',
          'Որսորդական քաբաբ',
          'Խորոված բանջարեղեն',
          'Խորոված կարտոֆիլ',
          'Խորոված սունկ',
          'Խորոված կծու պղպեղ',
          'Խորոված սոխ',
          'Խաշած իշխան',
          'Խորոված իշխան',
          'Խաշած սիգ',
          'Խորոված սիգ',
          'Խորոված թառափ'
        ]
      },
      {
        key: 'side',
        title: 'ԽԱՎԱՐՏՆԵՐ',
        items: [
          'Կարագով տապակած կարտոֆիլ',
          'Գրիլ բանջարեղեն',
          'Բրնձով և բանջարեղենով փլավ',
          'Հաճարով և սնկով փլավ',
          'Արիշտա',
          'Տապակած սպանախ',
          'Տապակած բաժուկի ճավ',
          'Կարտոֆիլի խյուս',
          'Բրինձ'
        ]
      }
    ]
  },
  margot: {
    version: 'v3-margot-transposed',
    sheetName: 'Responses – House of Margot',
    categories: [
      {
        key: 'salad',
        title: 'ԱՂՑԱՆՆԵՐ',
        items: [
          'Լոլիկով և թարխունով',
          'Կեսար՝ շնիցելով',
          'Թեթև և կանաչ',
          'Սմբուկով',
          'Մանրածովախեցգետնով և ավոկադոյով',
          'Նրա սիրելի աղցանը'
        ]
      },
      {
        key: 'main',
        title: 'ՀԻՄՆԱԿԱՆ ՈՒՏԵՍՏՆԵՐ',
        items: [
          'Վայրի սնկով լազանյա',
          'Բիֆ և չորիզո ռագու սպագետի',
          'Կծու անչոուսով տալիատելե',
          'Սպագետի կարբոնարա',
          'Ծովամթերքով տալիատելե',
          'Թաթար բորակի',
          'Քուֆթա արիշտայով',
          'Տոլմա Մարգոյից',
          'Հավի կրծքամիս ծնեբեկով',
          'Ծաղկակաղամբի սթեյք',
          'Իշխանի ֆիլե սպանախով',
          'Ճուտ Մարսել',
          'Հայկական խոզի չալաղաջ',
          'Ֆիլե մինյոն',
          'Սթեյք ֆրի',
          'Բադի կրծքամիս',
          'Սաղմոնի սթեյք սև բրնձով',
          'Ռիբայ սթեյք',
          'Մարգոյի սեթ',
          'Գյուղական սեթ',
          'Բիֆ Վելինգտոն'
        ]
      },
      {
        key: 'side',
        title: 'ԽԱՎԱՐՏՆԵՐ',
        items: [
          'Կարտոֆիլի խյուս',
          'Գրիլ արված բանջարեղեն',
          'Կարտոֆիլի ճմուռ',
          'Բրինձ',
          'Գրիլ արված ծնեբեկ',
          'Տեղում պատրաստված սոուսներ'
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

function getDishRows_(restaurant) {
  var rows = [];
  restaurant.categories.forEach(function (cat) {
    cat.items.forEach(function (name) {
      rows.push({ category: cat.key, name: name });
    });
  });
  return rows;
}

function getSheet_(restaurant) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(restaurant.sheetName);
  if (!sheet) sheet = ss.insertSheet(restaurant.sheetName);
  ensureHeaders_(sheet, restaurant);
  return sheet;
}

/**
 * (Re)builds the two-column header (category title + dish name per row) the
 * first time it sees a sheet that doesn't already carry this exact layout.
 * Families run across columns (there are usually far more dishes than
 * families, so this reads more naturally than the reverse). This also runs
 * automatically the first time the updated script is used against an older
 * sheet — which clears out whatever was there before, so back up anything
 * you want to keep before that happens.
 */
function ensureHeaders_(sheet, restaurant) {
  if (sheet.getRange(1, 1).getNote() === restaurant.version) return;

  var dishRows = getDishRows_(restaurant);
  var totalRows = FIXED_ROWS.length + dishRows.length;

  sheet.clear();

  var col2 = FIXED_ROWS.map(function () { return ['']; })
    .concat(dishRows.map(function (d) { return [d.name]; }));
  sheet.getRange(1, 2, totalRows, 1).setValues(col2);

  var row = FIXED_ROWS.length + 1;
  restaurant.categories.forEach(function (cat) {
    var span = cat.items.length;
    sheet.getRange(row, 1, span, 1).merge().setValue(cat.title);
    row += span;
  });

  FIXED_ROWS.forEach(function (label, i) {
    sheet.getRange(i + 1, 1, 1, 2).merge().setValue(label);
  });

  sheet.getRange(1, 1, totalRows, 2)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true)
    .setBackground('#F3EEE3');

  sheet.setFrozenRows(FIXED_ROWS.length);
  sheet.setFrozenColumns(2);
  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 240);

  sheet.getRange(1, 1).setNote(restaurant.version);
}

function findColIndex_(sheet, family) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < DATA_START_COL) return -1;

  var families = sheet.getRange(1, DATA_START_COL, 1, lastCol - DATA_START_COL + 1).getValues()[0];
  for (var i = 0; i < families.length; i++) {
    if (families[i] === family) return DATA_START_COL + i;
  }
  return -1;
}

function colToRecord_(sheet, colIndex, restaurant, dishRows) {
  var totalRows = FIXED_ROWS.length + dishRows.length;
  var values = sheet.getRange(1, colIndex, totalRows, 1).getValues();

  var record = { family: values[0][0], guestCount: values[1][0], ts: values[2][0] };
  restaurant.categories.forEach(function (cat) { record[cat.key] = {}; });

  dishRows.forEach(function (d, i) {
    var qty = values[FIXED_ROWS.length + i][0];
    if (qty) record[d.category][d.name] = qty;
  });

  return record;
}

function findRecord_(sheet, restaurant, family) {
  var colIndex = findColIndex_(sheet, family);
  if (colIndex === -1) return null;
  return colToRecord_(sheet, colIndex, restaurant, getDishRows_(restaurant));
}

function getAllRecords_(sheet, restaurant) {
  var dishRows = getDishRows_(restaurant);
  var lastCol = sheet.getLastColumn();
  var records = [];
  for (var c = DATA_START_COL; c <= lastCol; c++) {
    if (sheet.getRange(1, c).getValue()) records.push(colToRecord_(sheet, c, restaurant, dishRows));
  }
  return records;
}

function upsertRecord_(sheet, restaurant, data) {
  var dishRows = getDishRows_(restaurant);
  var totalRows = FIXED_ROWS.length + dishRows.length;

  var col = [[data.family], [data.guestCount], [data.ts || new Date().toISOString()]];
  dishRows.forEach(function (d) {
    var sel = data[d.category] || {};
    col.push([sel[d.name] || 0]);
  });

  var colIndex = findColIndex_(sheet, data.family);
  if (colIndex === -1) colIndex = Math.max(sheet.getLastColumn() + 1, DATA_START_COL);

  sheet.getRange(1, colIndex, totalRows, 1).setValues(col);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
