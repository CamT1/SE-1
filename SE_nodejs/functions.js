/*
request functions for the google calendar api
these all require an auth object
in our case, the auth object is our jwtclient(service account)
*/

//general format is function(calendarId,authInput,[parameters],callback)
//checks if busy at certain time, returns 'busy' or 'notBusy'
const {google} = require('googleapis');

//for generating a unique id for a lockout event
function checkBusy(calendarId, authInput,startTime, endTime, callback) {
    let response = '';
    let calendar = google.calendar('v3');
    calendar.freebusy.query({ //checks if busy at a certain time
        auth: authInput,
        resource: {
            items: [{
                id: calendarId
            }],
            timeMin: startTime,
            timeMax: endTime,
            timeZone: "Europe/London",
            groupExpansionMax: 1,
            calendarExpansionMax: 1
        }
    }, function(err, response) {
        if (err) {
            callback(err); 
        } else {
            for (key in response.data.calendars) {
                if (response.data.calendars[key].busy.length > 0) { // the busy object is non empty if there is a clash
                    callback(false,'busy');
                } else {
                    callback(false,'notBusy');
                }
            }
        }
    });
}

function listEvents(calendarId, authInput) {
    let calendar = google.calendar('v3');
    calendar.events.list({ // lists items from the calendar
        auth: authInput,
        calendarId: calendarId
    }, function(err, response) {
        if (err) {
            console.log(err.code);
            console.log(err.message);
        } else {
            console.log(response.data.items);
        }
    });
}

function addEvent(calendarId,authInput,startTime,endTime,summary,eventId,callback){
    let calendar = google.calendar('v3');
    calendar.events.insert({
        auth: authInput,
        calendarId: calendarId,
        resource:{
            start:{dateTime:startTime,timeZone:'Europe/London'},
            end: {dateTime:endTime,timeZone:'Europe/London'},
            summary:summary,
            id: eventId
        }  
    },function(err,response){
        if(err){
            callback(err);
        }
        else{
            callback(false);
        }
    });

}

//deletes event with given ID
function deleteEvent(calendarId,authInput,eventId){
    let calendar = google.calendar('v3');
    calendar.events.delete({
        auth:authInput,
        calendarId:calendarId,
        eventId:eventId
    },function(err,response){
        if(err){
            console.log(err.message);
        }
    });
}

module.exports.checkBusy = checkBusy;
module.exports.addEvent = addEvent;
module.exports.deleteEvent = deleteEvent;