class NFCTool {
    
    constructor(){
        if ('NDEFReader' in window) { 
            this.__ndef =  new window.NDEFReader();
            // Create the DOM elements
            this.__scanBtn = document.getElementById('scan');
            this.__writeBtn = document.getElementById('write');
            this.__sendPushBtn = document.getElementById('sendPush');
            this.__message = document.getElementById('message');
            this.__serialNumber = document.getElementById('serialNumber');
            this.__messageInput = document.getElementById('messageInput');

            // Bind events
            this.__scanBtn.addEventListener('click', this.__scan.bind(this));
            this.__writeBtn.addEventListener('click', this.__write.bind(this));
            this.__sendPushBtn.addEventListener('click', this.__sendPush.bind(this));
        } else {
            console.log('NFC Reader not available');
        }
    }

    /**
     * Scan: Returns a Promise resolved if starting NFC scan was successful.
     */
    async __scan(){
        this.__resetHTML();
        try {
            await this.__ndef.scan();
            
            console.log("Scan started successfully.");
            // Reading Error: An event fired when an error happened during reading.
            this.__ndef.onreadingerror = () => {
                this.__message.innerHTML = "Cannot read data from the NFC tag. Try another one?";
            };
            // Reading: An event fired when a new reading is available.
            this.__ndef.onreading = event => {
                console.log("NDEF message read.");
                this.__onReading(event);
            };
            await this.__sendPush();
        } catch(error){
            this.__message.innerHTML = `Error! Scan failed to start: ${error}.`
        };
    }


    /**
     * Write: Returns a Promise resolved if writing the message (String, ArrayBuffer or NDEF record) 
     * with options was successful.
     */
    async __write(e){
        e.preventDefault();
        try {
            // This line will avoid showing the native NFC UI reader
            await this.__ndef.scan();
            await this.__ndef.write({records: [{ recordType: "text", data: document.getElementById('messageInput').value }]});
            alert(`Value Saved!`);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Function to be called when a new reading is available.
     * 
     * param {} Object with the following properties:
     * message: String
     * serialNumber: String
     * */
    __onReading({message, serialNumber}) {
        this.__serialNumber.innerHTML = serialNumber;
        for (const record of message.records) {
            switch (record.recordType) {
                case "text":
                    const textDecoder = new TextDecoder(record.encoding);
                    this.__message.innerHTML = textDecoder.decode(record.data);
                    break;
                case "url":
                    // TODO: Read URL record with record data.
                    break;
                default:
                    // TODO: Handle other records with record data.
                }
        }
    };

    /**
     * Resets the HTML elements.
     */
    __resetHTML() {
        this.__message.innerHTML = "";
        this.__serialNumber.innerHTML = "";
        this.__messageInput.value = "";
    }

    /**
     * Send Push Notification
     */

    async __sendPush() {
        console.log('sendPush');
        try {
            const oneSignalApiURL= "https://onesignal.com/api/v1/notifications";
            const headers = {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic MjU3NjE5ZWMtYjFlYy00MjhkLTk2NWYtNjUwZjBmYjI2Yzkx"
            };

            const data = {
                "app_id": "a9241a21-adae-4879-8a99-a914bc6dd8bb",
                "included_segments": ["Subscribed Users"],
                "data": {"foo": "bar"},
                "contents": {"en": document.getElementById('messageInput').value}
            }
            const response = await fetch(oneSignalApiURL, {
                method: "POST",
                headers,
                body: JSON.stringify(data)
            });
              
            await response.json();
            this.__resetHTML(); 
            console.log("DONE SENDING");
        } catch(err) {
            console.log(err)
        }
   
  }
  
}

//Start the app
new NFCTool();