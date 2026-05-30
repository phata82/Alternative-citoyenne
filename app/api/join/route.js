import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstname, lastname, email, phone, quartier } = body;

    // Validation
    if (!firstname || !lastname || !email || !quartier) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    // Prepare credentials for Google Sheets
    // The private key needs to have escaped newlines replaced
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey || !process.env.GOOGLE_SHEET_ID) {
      console.error("Missing Google credentials in environment variables");
      return NextResponse.json(
        { error: 'Configuration du serveur manquante (Google Sheets).' },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Append to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:F', // Adjust if sheet name is different
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            new Date().toISOString(), // Date d'inscription
            firstname,
            lastname,
            email,
            phone || '',
            quartier
          ]
        ],
      },
    });

    return NextResponse.json({ success: true, message: "Votre demande d'adhésion a été prise en compte avec succès. Bienvenue parmi nous !" }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/join:', error);
    return NextResponse.json(
      { error: "Une erreur s'est produite lors de l'enregistrement de votre demande." },
      { status: 500 }
    );
  }
}
