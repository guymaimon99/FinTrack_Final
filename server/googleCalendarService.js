import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5001/api/auth/google/callback'
);

export const createCalendarEvent = async (accessToken, refreshToken, eventDetails) => {
    try {
        oauth2Client.setCredentials({ 
            access_token: accessToken,
            refresh_token: refreshToken
        });

        // Automatically refresh token if expired
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: eventDetails.title,
            description: eventDetails.description,
            start: {
                date: new Date(eventDetails.startDate).toISOString().split('T')[0],
                timeZone: 'Asia/Jerusalem',
            },
            end: {
                date: new Date(eventDetails.endDate).toISOString().split('T')[0],
                timeZone: 'Asia/Jerusalem',
            },
            colorId: '1', // Blue color
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 30 }, // 30 minutes before
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        return response.data;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
};

export const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
};

export const getTokens = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};