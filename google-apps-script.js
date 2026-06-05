// ============================================================
//  NIGERIA-CHINA FRIENDSHIP HOSPITAL
//  Google Apps Script — Lead Form → Google Sheets
//  
//  SETUP INSTRUCTIONS:
//  1. Go to https://sheets.google.com and create a new sheet named:
//       "NCFH Leads"
//  2. In the sheet, go to Extensions → Apps Script
//  3. Paste this entire script, replacing any existing code
//  4. Click "Deploy" → "New deployment" → Type: Web App
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Click Deploy, authorize, then copy the Web App URL
//  6. Paste the URL into GOOGLE_SHEET_URL in the landing page HTML
// ============================================================

function doPost(e) {
  try {
    // Parse the incoming JSON payload
    const data = JSON.parse(e.postData.contents);

    // Open the active spreadsheet and get/create the Leads sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('NCFH Leads');

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('NCFH Leads');
      sheet.appendRow([
        'Timestamp (Lagos)',
        'Full Name',
        'Phone Number',
        'Email Address',
        'Location / Area',
        'Service Requested',
        'Preferred Appointment Date',
        'Source',
        'Status'
      ]);

      // Style the header row
      const header = sheet.getRange(1, 1, 1, 9);
      header.setBackground('#1D9E75');
      header.setFontColor('#FFFFFF');
      header.setFontWeight('bold');
      header.setFontSize(11);
      sheet.setFrozenRows(1);

      // Set column widths
      sheet.setColumnWidth(1, 180); // Timestamp
      sheet.setColumnWidth(2, 160); // Name
      sheet.setColumnWidth(3, 140); // Phone
      sheet.setColumnWidth(4, 200); // Email
      sheet.setColumnWidth(5, 150); // Location
      sheet.setColumnWidth(6, 200); // Service
      sheet.setColumnWidth(7, 170); // Date
      sheet.setColumnWidth(8, 160); // Source
      sheet.setColumnWidth(9, 120); // Status
    }

    // Append the new lead row
    sheet.appendRow([
      data.timestamp  || new Date().toLocaleString('en-NG', {timeZone: 'Africa/Lagos'}),
      data.name       || '',
      data.phone      || '',
      data.email      || '',
      data.location   || '',
      data.service    || '',
      data.date       || '',
      data.source     || 'Landing Page',
      'New Lead'     // default status
    ]);

    // Highlight the new row in light green
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 9).setBackground('#E1F5EE');

    // Optional: Send an email notification to the hospital admin
    sendNotificationEmail(data);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── EMAIL NOTIFICATION ──────────────────────────────────────
function sendNotificationEmail(data) {
  try {
    const ADMIN_EMAIL = 'info@nigeriachinafriendship.com'; // ← change if needed

    const subject = `🏥 New Patient Lead: ${data.name} — ${data.service}`;
    const body = `
A new appointment request has been submitted from your Google Ads landing page.

PATIENT DETAILS
───────────────
Name:      ${data.name}
Phone:     ${data.phone}
Email:     ${data.email}
Location:  ${data.location}
Service:   ${data.service}
Date:      ${data.date}
Time:      ${data.timestamp}
Source:    ${data.source}

ACTION REQUIRED
────────────────
Please call or WhatsApp this patient within 24 hours to confirm their appointment.

WhatsApp link: https://wa.me/${data.phone.replace(/\D/g,'')}

───────────────────────────────────────────
Nigeria-China Friendship Hospital
Automated Lead Notification System
    `.trim();

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: subject,
      body: body
    });
  } catch (err) {
    Logger.log('Email notification failed: ' + err.toString());
    // Not critical — don't throw
  }
}

// ── GET handler (for testing the deployment URL) ─────────────
function doGet(e) {
  return ContentService
    .createTextOutput('NCFH Lead Form endpoint is live ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}
