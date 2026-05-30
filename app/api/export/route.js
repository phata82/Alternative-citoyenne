import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password');

    // Simple password protection
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return new NextResponse('Non autorisé. Mot de passe incorrect ou non configuré.', { status: 401 });
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey || !process.env.GOOGLE_SHEET_ID) {
      return new NextResponse('Configuration du serveur manquante.', { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:F', // Assuming columns A to F are used
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return new NextResponse('Aucune donnée trouvée.', { status: 404 });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Adhésions');

    // Add rows to worksheet
    worksheet.addRows(rows);

    // Style the header row if it exists
    if (rows.length > 0) {
      worksheet.getRow(1).font = { bold: true };
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return as downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="adhesions_alternative_citoyenne.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error('Error in /api/export:', error);
    return new NextResponse("Une erreur s'est produite lors de l'exportation.", { status: 500 });
  }
}
