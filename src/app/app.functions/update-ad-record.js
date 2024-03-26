const axios = require('axios');


async function updateAd(adId, properties, headers){

  try{

    const url = `https://api.hubapi.com/crm/v3/objects/2-116620270/${adId}`;
    const data = properties;

    const updateRequest = await axios.patch(url, data, headers);
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
      "Authorization": `Bearer ${process.env["CRM_UI_APP"]}`,
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
      response = {
        updateMessage: "Die Dateientfernung wurde erfolgreich aktualisiert",
        docAttached: docStatus,
        buttonText: "Confirm Attachment"

      }
    }else if(updateProperty.status && updateProperty.status === 200 && docStatus === "True" || updateProperty.status && updateProperty.status === 201 && docStatus === "True"){
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
