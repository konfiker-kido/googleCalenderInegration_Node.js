
import mongoose from "mongoose";
import express, { Application } from "express";
import connectDB from "./config/DB";
import { google } from "googleapis";
import axios from "axios";
import dayjs from "dayjs";


const app: Application = express();
app.use(express.json());

const calender = google.calendar({
    version: 'v3', 
    auth: 'AIzaSyDqRnG1emSeIIv0eyMbMR7ocuH58rgkXQg' // specify your API key here
  });    
// connectDB();

const oauth2Client = new google.auth.OAuth2(
   CLIENT_ID,
   CLIENT_SECRET,
   REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/calendar"];
    
app.get("/googleAuth", (req, res) => {  
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    // If you only need one scope, you can pass it as a string
    scope: scopes,
  });
  
  res.redirect(url);
});


// Step 2: Callback endpoint to handle Google’s redirect and create the calendar event
app.get("/googleCalender/redirect", async (req, res) => { 
   
    const code = req.query.code as string ;  
    try {

        // Get tokens using the authorization code
        const { tokens } = await oauth2Client.getToken(code); 
        oauth2Client.setCredentials(tokens);

        res.send({
            message: "You have successfully logged in",
            tokens, // You may want to return or log tokens here
        });
    } catch (error) {
        console.error("Error retrieving tokens:", error);
        res.status(500).send({
            message: "An error occurred during authentication",
            error: error, 
        });
    }  
});


const calendar = google.calendar('v3');

app.get('/googleCalender/schedule_event', async (req, res) => {
    try {
        const event = {
            summary: "Meeting with Project Team", // Event title
            description: "Discussion on project milestones and next steps.", // Event description
            start: {
                dateTime: dayjs().add(1, 'day').set('hour', 10).set('minute', 0).toISOString(), // Event start time
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: dayjs().add(1, 'day').set('hour', 12).set('minute', 0).toISOString(), // Event end time
                timeZone: "Asia/Kolkata",
            },
            location: "Google Meet", // Optional location field
            attendees: [
                { email: "attendee1@example.com" },
                { email: "attendee2@example.com" },
            ],
        };

        const response = await calendar.events.insert({
            auth: oauth2Client, // Ensure oauth2Client is authenticated
            calendarId: "primary",
            requestBody: event,
        });

        res.send({
            message: "Event successfully created in Google Calendar",
            eventLink: response.data.htmlLink, // Link to the Google Calendar event
        });
    } catch (error) {
        console.error("Error scheduling event:", error);
        res.status(500).send({
            message: "An error occurred while creating the event",
            error: error, 
        });
    }
});



// const auth2Client=
const PORT = 8087;
app.listen(PORT, () => {
  console.log("Sever started Running on PORT: ", PORT);
});




