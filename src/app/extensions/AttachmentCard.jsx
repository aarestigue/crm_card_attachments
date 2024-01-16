import React, { useState, useEffect } from "react";
import {
  Divider,
  Link,
  Button,
  Text,
  Input,
  Flex,
  hubspot,
} from "@hubspot/ui-extensions";

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
  />
));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({ context, runServerless, sendAlert, fetchProperties }) => {
  const [text, setText] = useState("");
  const [docAttached, setDocAttached] = useState(null);
  const [adId, setAdId] = useState("");
  const [button, setButton] = useState("");
  

useEffect(() => {
  fetchProperties(["druckunterlage_vorhanden_", "hs_object_id"])
    .then(properties => {
      setDocAttached(properties.druckunterlage_vorhanden_);
      setAdId(properties.hs_object_id);
  });
}, [fetchProperties]);
 
useEffect(() => {
  
      if(docAttached=== "True"){
        setButton("Druckunterlage entfernt");
      }else{
        setButton("Druckunterlage bestätigen");
      }

}, [docAttached]);


  // Call serverless function to execute with parameters.
  // The `myFunc` function name is configured inside `serverless.json`
  const handleClick = async () => {
    const { response } = await runServerless({ name: "updateAdRecord", parameters: { text: text, attachment: docAttached, adId: adId } });
    setDocAttached(response.docAttached);
    sendAlert({ message: response.updateMessage });
    console.log(response);
  };


  return (
    <>
      <Text>
        <Text format={{ fontWeight: "bold" }}>
          Bestätigung der Druckunterlage
        </Text>
        Um zu bestätigen, dass ein Anhang hochgeladen oder entfernt wurde, klicken Sie bitte auf den Button. 
      </Text>
      <Flex direction="row" align="end" gap="small">
        <Button 
        type="submit" 
        onClick={handleClick}
        variant="destructive"
        size="md"
        >
          {button}
        </Button>
      </Flex>
      <Divider />
  
    </>
  );
};
