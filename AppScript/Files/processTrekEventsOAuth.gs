/**
 * Saleforce Auth flow
 * @see https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/quickstart_oauth.htm
 */

var CLIENT_ID = '3MVG9n_HvETGhr3AQVaem1AB9D_em0djS49UsZ4dWIcS2hxHgYjKcILvfw5YpKfIprQVJnuh0D9R9KXngVMke';
var CLIENT_SECRET = '44D831573D1DA52949B012C2FF68B6641F7B4BC94F6EDEF50FEC5FF32C6A281C';
var payload = {};

/**
 * Authorizes and makes a request to the Saleforce API.
 */
function onFormSubmitNew() {
  var service = getService_();
  if (service.hasAccess()) {

    record_array = []

    var form = FormApp.openById('1EDZkNVX6tFGevSr6uMxRNeTe43o0ZGLQ_T1sK_tsljo'); // Form ID
    var formResponses = form.getResponses();
    var formCount = formResponses.length;

    var formResponse = formResponses[formCount - 1];
    var itemResponses = formResponse.getItemResponses();

    for (var j = 0; j < itemResponses.length; j++) {
      var itemResponse = itemResponses[j];
      var title = itemResponse.getItem().getTitle();
      var answer = itemResponse.getResponse();

      if(answer){
        appendToPayload(title, answer);
      }

      record_array.push(answer);
    }
    
    payload = Utilities.jsonStringify(payload);

    Logger.log('Payload ---- ' + payload);

    var url = service.getToken().instance_url +
        '/services/data/v26.0/sobjects/Trekking_Event_Delegate__c/';
    // Make the HTTP request using a wrapper function that handles expired
    // sessions.
    var response = withRetry(service, function() {
      return UrlFetchApp.fetch(url, getUrlFetchPOSTOptions(service, payload));
    });
    //var result = JSON.parse(response.getContentText());
    //Logger.log(JSON.stringify(result, null, 2));
  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
}

function getUrlFetchPOSTOptions(service, payload){
  return {
    "method": "post",
    "contentType" : "application/json",
    "payload" : payload,
    "headers" : {
      "Authorization" : "Bearer " + service.getAccessToken()
    }
  }
}

function appendToPayload(key, data){

  if(key === "Select Your Organization Name"){
    payload["Organization_Name__c"] = data;
  }
  if(key === "Your Event Name?"){
    payload["Name"] = data;
  }
  if(key === "Event Start Date?"){
    payload["Event_Start_Date__c"] = data;
  }
  if(key === "Departure time?"){
    payload["Departure_Time_Slot__c"] = String(data[0]);
  }
  if(key === "Event End Date?"){
    payload["Event_End_Date__c"] = data;
  }
  if(key === "Return back time slot"){
    payload["Return_Back_Time_Slot__c"] = data;
  }
  if(key === "Event Cost?"){
    payload["Event_Cost__c"] = data;
  }
  if(key === "Number of Seats?"){
    payload["Number_of_Seats__c"] = parseInt(data[0]);
  }
  if(key === "Departing From?"){
    payload["Departure_From__c"] = data.join(', ');
  }
  if(key === "Enter a link to get more info about event and register for event. "){
    payload["More_Details_Link__c"] = data;
  }
  if(key === "Destination 1"){
    payload["Destination_1__c"] = data;
  }
  if(key === "Visiting date for 1st destination"){
    payload["Visit_Date_D1__c"] = data;
  }
  if(key === "Visiting time slot for 1st destination"){
    payload["Visit_Slot_D1__c"] = data;
  }
  if(key === "Destination 2"){
    payload["Destination_2__c"] = data;
  }
  if(key === "Visiting Date for 2nd destination"){
    payload["Visit_Date_D2__c"] = data;
  }
  if(key === "Visiting time slot for 2nd destination"){
    payload["Visit_Slot_D2__c"] = data;
  }
  if(key === "Destination 3"){
    payload["Destination_3__c"] = data;
  }
  if(key === "Visiting date for 3rd destination"){
    payload["Visit_Date_D3__c"] = data;
  }
  if(key === "Visiting time slot for 3rd destination"){
    payload["Visit_Slot_D3__c"] = data;
  }
  if(key === "Destination 4"){
    payload["Destination_4__c"] = data;
  }
  if(key === "Visiting date for 4th destination"){
    payload["Visit_Date_D4__c"] = data;
  }
  if(key === "Visiting time slot for 4th destination"){
    payload["Visit_Slot_D4__c"] = data;
  }
  if(key === "Destination 5"){
    payload["Destination_5__c"] = data;
  }
  if(key === "Visiting date for 5th destination"){
    payload["Visit_Date_D5__c"] = data;
  }
  if(key === "Visiting time slot for 5th destination"){
    payload["Visit_Slot_D5__c"] = data;
  }
  if(key === "Future Date 1"){
    payload["Future_Date_1__c"] = data;
  }
  if(key === "Future Date 2"){
    payload["Future_Date_2__c"] = data;
  }
  if(key === "Future Date 3"){
    payload["Future_Date_3__c"] = data;
  }
  if(key === "Future Date 4"){
    payload["Future_Date_4__c"] = data;
  }
  if(key === "Future Date 5"){
    payload["Future_Date_5__c"] = data;
  }

}

/**
 * Wrapper function that detects an expired session, refreshes the access token,
 * and retries the request again.
 * @param {OAuth2.Service_} service The service to refresh.
 * @param {Function} func The function that makes the UrlFetchApp request
                          and returns the response.
 * @return {UrlFetchApp.HTTPResponse} The HTTP response.
 */
function withRetry(service, func) {
  var response;
  var content;
  try {
    response = func();
    Logger.log(response);
    content = response.getContentText();
  } catch (e) {
    content = e.toString();
  }
  if (content.indexOf('INVALID_SESSION_ID') !== -1) {
    service.refresh();
    return func();
  }
  return response;
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  getService_().reset();
}

/**
 * Configures the service.
 */
function getService_() {
  return OAuth2.createService('Saleforce')
      // Set the endpoint URLs.
      .setAuthorizationBaseUrl(
          'https://login.salesforce.com/services/oauth2/authorize')
      .setTokenUrl('https://login.salesforce.com/services/oauth2/token')

      // Set the client ID and secret.
      .setClientId(CLIENT_ID)
      .setClientSecret(CLIENT_SECRET)

      // Set the name of the callback function that should be invoked to
      // complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to be requested.
      .setScope('full refresh_token');
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService_();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}

/**
 * Logs the redict URI to register.
 */
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}
