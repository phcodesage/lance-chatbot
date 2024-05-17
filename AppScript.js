function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleOutput(result) {
  var output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  output.headers = {
    "Access-Control-Allow-Origin": "*",
  };
  return output;
}

function handleRequest(e) {
  var sheetId = "SHEET_ID";
  const ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(e.parameter.sheetName);

  if (!sheet) {
    return handleOutput({
      status: 400,
      message: "Sheet not found",
    });
  }

  var result;
  switch (e.parameter.action) {
    case "read":
      result = readData(sheet);
      break;
    case "write":
      result = writeData(sheet, e.postData.contents);
      break;
    case "update":
      result = updateData(sheet, e.postData.contents);
      break;
    case "getById":
      var id = e.parameter.id;
      result = getDataById(sheet, id);
      break;
    default:
      result = { status: 400, message: "Invalid action" };
  }
  return handleOutput(result);
}

function readData(sheet) {
  var rows = sheet.getDataRange().getValues();
  var headers = rows.shift();
  var data = rows.map((row) => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header.toLowerCase()] = row[index];
    });
    return obj;
  });
  return { status: 200, message: "Data found.", data };
}

function getDataById(sheet, id) {
  if (!id) {
    return { status: 400, message: 'Required "id" in params.' };
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var dataRange = sheet.getDataRange().getValues();
  var idIndex = headers.indexOf("id");
  if (idIndex < 0) {
    return { status: 400, message: 'Column of name "id" not found in table' };
  }

  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][idIndex].toString() === id.toString()) {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header.toLowerCase()] = dataRange[i][index];
      });
      return { status: 200, message: "Data found.", data: obj };
    }
  }
  return { status: 400, message: "No data found with the specified ID." };
}

function writeData(sheet, data) {
  var dataObject = JSON.parse(data);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = headers.map((header) => dataObject[header.toLowerCase()] || "");

  var idIndex = headers.indexOf("id");
  if (idIndex < 0) {
    return { status: 400, message: 'Column of name "id" not found in table' };
  }
  var existingIds = sheet
    .getRange(2, idIndex + 1, sheet.getLastRow(), 1)
    .getValues()
    .flat();
  if (existingIds.includes(dataObject.id)) {
    return { status: 400, message: "Entry already exists with the same ID" };
  }

  try {
    sheet.appendRow(newRow);
    return { status: 200, message: "Data saved successfully." };
  } catch (e) {
    return { status: 400, message: "Failed to write data: " + e.toString() };
  }
}

function updateData(sheet, data) {
  var dataObject = JSON.parse(data);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIndex = headers.indexOf("id");
  if (idIndex < 0) {
    return { status: 400, message: 'Column of name "id" not found in table.' };
  }
  var rows = sheet.getDataRange().getValues();
  var updated = false;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] == dataObject.id) {
      let rowUpdate = headers.map(
        (header) =>
          dataObject[header.toLowerCase()] || rows[i][headers.indexOf(header)]
      );
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowUpdate]);
      updated = true;
      break;
    }
  }

  return updated
    ? { status: 200, message: "Data updated successfully." }
    : { status: 400, message: "No matching record found to update." };
}
