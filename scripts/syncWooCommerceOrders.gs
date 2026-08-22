function syncWooCommerceOrders() {
  const WC_URL          = "https://aimz.blackbear-dz.com/wp-json/wc/v3/orders";
  const CONSUMER_KEY    = "ck_2da369e858de423af8829a2d37264e2df99b5049";
  const CONSUMER_SECRET = "cs_b8ed4abe8e3c711d5829a430e98296b14906bf2a";

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("blackbear");

  if (!sheet) {
    Logger.log("ERROR: Sheet 'blackbear' not found!");
    return;
  }

  // Scan from row 2 onwards to find first empty phone (column C)
  // (Assuming row 1 contains headers)
  const lastRow = sheet.getLastRow();
  const startRow = 2;
  let trueLastRow;

  if (lastRow < startRow) {
    // Sheet is empty or only has headers
    trueLastRow = startRow;
  } else {
    const colC = sheet.getRange(
      startRow,
      3,
      lastRow - startRow + 1,
      1
    ).getValues();

    trueLastRow = lastRow + 1; // Default: append at end

    for (let i = 0; i < colC.length; i++) {
      if (!colC[i][0] || String(colC[i][0]).trim() === "") {
        let emptyCount = 1;

        for (
          let j = i + 1;
          j < i + 5 && j < colC.length;
          j++
        ) {
          if (
            !colC[j][0] ||
            String(colC[j][0]).trim() === ""
          ) {
            emptyCount++;
          }
        }

        if (emptyCount >= 5) {
          trueLastRow = i + startRow;
          break;
        }
      }
    }
  }

  Logger.log(`First empty row: ${trueLastRow}`);

  // Hardcoded start date
  const afterDate = "2025-07-23T18:44:00.000Z";
  Logger.log(`Fetching orders after: ${afterDate}`);

  // Existing order IDs from column Y (index 24)
  const existingData = sheet.getDataRange().getValues();

  const existingOrderIds = new Set(
    existingData
      .map(row => String(row[24]).trim())
      .filter(v => v)
  );

  const wilayaMap = {
    "DZ-01": "Adrar",
    "DZ-02": "Chlef",
    "DZ-03": "Laghouat",
    "DZ-04": "Oum El Bouaghi",
    "DZ-05": "Batna",
    "DZ-06": "Béjaïa",
    "DZ-07": "Biskra",
    "DZ-08": "Béchar",
    "DZ-09": "Blida",
    "DZ-10": "Bouira",
    "DZ-11": "Tamanrasset",
    "DZ-12": "Tébessa",
    "DZ-13": "Tlemcen",
    "DZ-14": "Tiaret",
    "DZ-15": "Tizi Ouzou",
    "DZ-16": "Alger",
    "DZ-17": "Djelfa",
    "DZ-18": "Jijel",
    "DZ-19": "Sétif",
    "DZ-20": "Saïda",
    "DZ-21": "Skikda",
    "DZ-22": "Sidi Bel Abbès",
    "DZ-23": "Annaba",
    "DZ-24": "Guelma",
    "DZ-25": "Constantine",
    "DZ-26": "Médéa",
    "DZ-27": "Mostaganem",
    "DZ-28": "M'Sila",
    "DZ-29": "Mascara",
    "DZ-30": "Ouargla",
    "DZ-31": "Oran",
    "DZ-32": "El Bayadh",
    "DZ-33": "Illizi",
    "DZ-34": "Bordj Badji Mokhtar",
    "DZ-35": "Boumerdès",
    "DZ-36": "El Tarf",
    "DZ-37": "Tindouf",
    "DZ-38": "Tissemsilt",
    "DZ-39": "El Oued",
    "DZ-40": "Khenchela",
    "DZ-41": "Souk Ahras",
    "DZ-42": "Tipaza",
    "DZ-43": "Mila",
    "DZ-44": "Aïn Defla",
    "DZ-45": "Naâma",
    "DZ-46": "Aïn Témouchent",
    "DZ-47": "Ghardaïa",
    "DZ-48": "Relizane",
    "DZ-49": "Timimoun",
    "DZ-50": "Bordj Badji Mokhtar",
    "DZ-51": "Ouled Djellal",
    "DZ-52": "Béni Abbès",
    "DZ-53": "In Salah",
    "DZ-54": "In Guezzam",
    "DZ-55": "Touggourt",
    "DZ-56": "Djanet",
    "DZ-57": "El M'Ghair",
    "DZ-58": "El Meniaa"
  };

  // Send credentials as HTTP Basic Auth header
  const authHeader =
    "Basic " +
    Utilities.base64Encode(
      CONSUMER_KEY + ":" + CONSUMER_SECRET
    );

  let page = 1;
  let newRowsAdded = 0;
  let keepGoing = true;

  while (keepGoing) {

    const url =
      `${WC_URL}?per_page=100&orderby=date&order=asc&after=${afterDate}&page=${page}`;

    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        Authorization: authHeader
      }
    });

    const code = response.getResponseCode();

    Logger.log(`Page ${page} — HTTP ${code}`);

    if (code !== 200) {
      Logger.log(
        `Response body: ${response.getContentText()}`
      );
      break;
    }

    const orders = JSON.parse(
      response.getContentText()
    );

    Logger.log(
      `Page ${page}: ${orders.length} orders`
    );

    if (orders.length === 0) {
      break;
    }

    orders.forEach(order => {

      const orderId = String(order.id);

      // Skip existing orders
      if (existingOrderIds.has(orderId)) {
        return;
      }

      // Customer information
      const nom =
        order.billing.last_name || "";

      const prenom =
        order.billing.first_name || "";

      const tel =
        String(order.billing.phone || "");

      // Instagram/Facebook handle, collected as an optional field at checkout
      // and stored as order-level meta_data (not per line item).
      const socialHandle =
        (order.meta_data || [])
          .find(m => m.key === "_social_handle")
          ?.value || "";

      // Address
      const address1 =
        order.billing.address_1 || "";

      const address2 =
        order.billing.address_2 || "";

      const city =
        order.billing.city || "";

      const state =
        order.billing.state || "";

      const wilayaName =
        wilayaMap[state] || state;

      const fullAddr = [
        address1,
        address2,
        wilayaName,
        city
      ]
        .filter(Boolean)
        .join(", ");

      // Products
      const produit = order.line_items
        .map(item => {

          const variation = item.meta_data
            .filter(
              m =>
                m.display_key &&
                !m.display_key.startsWith("_")
            )
            .map(m => m.display_value)
            .join("/");

          return variation
            ? `${item.name} (${variation}) x${item.quantity}`
            : `${item.name} x${item.quantity}`;
        })
        .join(" | ");

      // Product price
      const prixProduit =
        parseFloat(
          order.line_items
            .reduce(
              (sum, item) =>
                sum + parseFloat(item.subtotal),
              0
            )
            .toFixed(2)
        );

      // Shipping price
      const prixLivraison =
        parseFloat(order.shipping_total) || 0;

      // Order date
      const orderDate =
        new Date(order.date_created);

      const dateStr =
        `${orderDate.getDate()}/${
          orderDate.getMonth() + 1
        }/${orderDate.getFullYear()}`;

      // =====================================================
      // COLUMNS A–R
      // =====================================================

      sheet
        .getRange(trueLastRow, 1, 1, 18)
        .setValues([[
          nom,            // A - nom
          prenom,         // B - prénom
          tel,            // C - téléphone
          false,          // D - bordereau
          false,          // E - création de bordereau
          false,          // F - reporté
          socialHandle,   // G - note (Instagram / Facebook)
          "",             // H - plateforme
          "",             // I - confirmateur
          "",             // J - type de livraison
          fullAddr,       // K - adresse
          wilayaName,     // L - wilaya
          city,            // M - commune
          "",             // N - desk adresse
          produit,        // O - produit
          false,          // P - échange
          prixProduit,    // Q - prix produit
          prixLivraison   // R - prix livraison
        ]]);

      // =====================================================
      // COLUMN S = Q + R
      // =====================================================

      sheet
        .getRange(trueLastRow, 19)
        .setFormula(
          `=Q${trueLastRow}+R${trueLastRow}`
        );

      // =====================================================
      // COLUMNS T–Y
      // =====================================================

      sheet
        .getRange(trueLastRow, 20, 1, 6)
        .setValues([[
          false,          // T - retour
          false,          // U - livrer
          false,          // V - en cours
          "",             // W - remarque suivi
          dateStr,        // X - DATE
          orderId         // Y - WooCommerce Order ID
        ]]);

      // Prepare next row
      trueLastRow++;

      existingOrderIds.add(orderId);

      newRowsAdded++;
    });

    // If less than 100 orders, we're on the last page
    if (orders.length < 100) {
      keepGoing = false;
    }

    page++;
  }

  Logger.log(
    `Sync complete. ${newRowsAdded} new orders added.`
  );
}
