const axios = require('axios');


async function updateAd(adId, properties, headers){

  try{
 
    const url = `https://api.hubapi.com/crm/v3/objects/2-116620270/${adId}`;
    //const url = `https://api.hubapi.com/crm/v3/objects/anzeigen/${adId}`;
    
    const data = properties;
    /* var config = {
      method: 'patch',
      url: url,
      headers: { 
        'Authorization': `Bearer ${process.env.PRIVATE_APP_ACCESS_TOKEN}`, 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      return JSON.stringify(response.data)
    })
    .catch(function (error) {
      console.log(error);
    }); */



    const updateRequest = await axios.patch(url, data, headers);
    return updateRequest;

  }catch(err){
    console.log(err);
    throw err;
  }
}

async function createNote(adId, headers, message){

  try{
    const now = new Date();
    const isoTimestamp = now.toISOString();
    console.log(isoTimestamp);
    const url = `https://api.hubapi.com/crm/v3/objects/notes`;
    
    const data = {
      "associations": [
        {
          "types": [
            {
              "associationCategory": "USER_DEFINED",
              "associationTypeId": 92
            }
          ],
          "to": {
            "id": `${adId}`
          }
        }
      ],
      "properties": {
        "hs_note_body": `${message}`,
        "hs_timestamp": `${isoTimestamp}`
      }
    }

    const updateRequest = await axios.post(url, data, headers);
    return updateRequest;

  }catch(err){
    console.log(err);
    throw err;
  }
}

exports.main = async(context = {}, sendResponse) => {
  
  const headers = {
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${process.env.jahr_media_standard_secret}`,
      //'authorization': `Bearer ${process.env.HAPIKEY_JAHR_MEDIA}`,
    }
  }
  
  const docAttachment = context.parameters['attachment'];
  const adId = context.parameters['adId'];
  let payload = null;
  let response= {};
  let docStatus;

  
  

  try {

    if (docAttachment && docAttachment === "True"){
      docStatus = "False";
      payload ={
        "properties": {
          "druckunterlage_vorhanden_": "False"
        } 
      }
    }else{
      docStatus = "True";
      payload ={
        "properties":{
          "druckunterlage_vorhanden_": "True"
        }
      }
    }
    
    const updateProperty = await updateAd(adId, payload, headers);

    if(updateProperty.status && updateProperty.status === 200 && docStatus === "False" || updateProperty.status && updateProperty.status === 201 && docStatus === "False" ){
      const message = "Druckunterlagen wurden entfernt."
      const createEngagement = await createNote(adId, headers, message);
      response = {
        updateMessage: "Die Dateientfernung wurde erfolgreich aktualisiert",
        docAttached: docStatus,
        buttonText: "Confirm Attachment"

      }
    }else if(updateProperty.status && updateProperty.status === 200 && docStatus === "True" || updateProperty.status && updateProperty.status === 201 && docStatus === "True"){
      const message = "Neue Druckunterlagen wurden hochgeladen."
      const createEngagement = await createNote(adId, headers, message);
      response = {
        updateMessage: "Die Anzeigenbestätigung wurde erfolgreich aktualisiert!",
        docAttached: docStatus,
        buttonText: "Remove confirmation"
      }  
    }else{
      response = {
        updateMessage: "Es ist ein fehler aufgetreten. Bitte versuchen sie es erneut.",
        docAttached: docStatus,
        buttonText: "Confirm Attachment"
      }
    }
    console.log("status", updateProperty.status, response);

    return response;

    
  } catch (error) {
    console.log(error);
    response = {
      updateMessage: `Es ist ein fehler aufgetreten. Bitte versuchen sie es erneut. Error: ${error.message}`,
      docAttached: docStatus,
      buttonText: "Confirm Attachment"
    }
    return response;
  }
};
