const sentFiles = document.querySelector('.sent');
const receivedFiles = document.querySelector('.received');
const fileInputHandler = document.querySelector('#fileHandler');
const sendFileButton = document.querySelector('#sendFile');
const socketIO = new io();

async function createFileFromBase64StringAndAppendDownloadLink(data) {
    if (!data.base64String) return;
    const fileUrl = `data:${data.fileType};base64,${data.base64String}`;
    const fileBlob = await fetch(fileUrl)
    .then(file => file.arrayBuffer())
    .then(buffer => new Blob([buffer], { type: data.fileType }));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileBlob);
    a.innerText = data.fileName;
    a.download = data.fileName;
    receivedFiles.appendChild(a);
}

function registerSocketListeners() {
    socketIO.on('receiveFile', createFileFromBase64StringAndAppendDownloadLink);
}

function sendDataToServerViaSocket(data, channel) {
    socketIO.emit(channel, data);
}

function setServerURL() {
    const serverURLSpan = document.getElementById('serverURL');
    serverURLSpan.innerText = window.location.href;    
}

function attachSendFileCallback() {
    const toBase64 = (buffer) => btoa( // TODO: please read about the classes/functions used here;
        new Uint8Array(buffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    sendFileButton.addEventListener('click', async () => {
        const file = fileInputHandler.files[0];
        if (!file) return;
        file.arrayBuffer()
        .then(response => toBase64(response))
        .then(base64String => {
            sendDataToServerViaSocket({ base64String, fileType: file.type, fileName: file.name }, 'sendFile');
            fileInputHandler.files = undefined;
        });
    });
}

function main() {
    setServerURL();
    registerSocketListeners();
    attachSendFileCallback();
}

main();
