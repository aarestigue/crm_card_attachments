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
      "Authorization": `Bearer ${process.env.jahr_media_standard_secret}`,
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
        updateMessage: "Attachment was removed succesfully!",
        docAttached: docStatus,
        buttonText: "Confirm Attachment"

      }
    }else if(updateProperty.status && updateProperty.status === 200 && docStatus === "True" || updateProperty.status && updateProperty.status === 201 && docStatus === "True"){
      response = {
        updateMessage: "Attachment was confirmed succesfully!",
        docAttached: docStatus,
        buttonText: "Remove confirmation"
      }  
    }else{
      response = {
        updateMessage: "There was an error. Please try again",
        docAttached: docStatus,
        buttonText: "Confirm Attachment"
      }
    }
    console.log("status", updateProperty.status, response);

    return response;

    
  } catch (error) {
    console.log(error);
    response = {
      updateMessage: `There was an error. Please try again. Error: ${error.message}`,
      docAttached: docStatus,
      buttonText: "Confirm Attachment"
    }
    return response;
  }
};
