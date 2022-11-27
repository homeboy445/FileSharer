const sentFiles = document.querySelector('.sent');
const receivedFiles = document.querySelector('.received');
const fileInputHandler = document.querySelector('#fileHandler');
const sendFileButton = document.querySelector('#sendFile');
const socketIO = new io();
let fileHandler;

async function createDownloadLinkFromBlob(fileBlob, fileName) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileBlob);
    a.innerText = fileName;
    a.download = fileName;
    receivedFiles.appendChild(a);
}

function registerSocketListeners() {
    socketIO.on('receiveFile', (data) => {
        FileHandler.processReceivedChunk(data, (blob, fileObject) => {
            console.log("Done the file processing...");
            createDownloadLinkFromBlob(blob, fileObject.fileName);
        });
    });
}

function sendDataToServerViaSocket(data, channel) {
    socketIO.emit(channel, data);
}

function setServerURL() {
    const serverURLSpan = document.getElementById('serverURL');
    serverURLSpan.innerText = window.location.href;    
}

function initializeFileHandler() {
    fileHandler = new FileHandler(fileInputHandler.files[0]);
}

function attachSendFileCallback() {
    // const toBase64 = (buffer) => btoa( // TODO: please read about the classes/functions used here;
    //     new Uint8Array(buffer)
    //       .reduce((data, byte) => data + String.fromCharCode(byte), '')
    // );
    sendFileButton.addEventListener('click', async () => {
        initializeFileHandler();
        fileHandler.splitIntoChunksAndSendData((data) => {
            sendDataToServerViaSocket(data, 'sendFile');
        });
    });
}

function main() {
    setServerURL();
    registerSocketListeners();
    attachSendFileCallback();
}

main();
