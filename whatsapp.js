const express = require("express");
const app = express();
const wppconnect = require("@wppconnect-team/wppconnect");
var WppClient; //variável que receberá o cliente para ser chamada em outras funções da lib
//variable that the client will receive to be called in other lib functions

app.use(express.json()); //parser utizado para requisições via post,....parser used for requests via post,
app.use(express.urlencoded({ extended: true }));

app.get("/getconnectionstatus", async function (req, res) {
  var mensagemretorno = ""; //mensagem de retorno da requisição ... request return message
  var sucesso = false; //Se houve sucesso na requisição ... If the request was successful

  if (typeof WppClient === "object") {
    // Validando se a lib está iniciada .... Validating if lib is started
    mensagemretorno = await WppClient.getConnectionState(); // validadado o estado da conexão com o whats
    sucesso = true; //whats connection status validated
  } else {
    mensagemretorno =
      "A WppClient não foi inicializada - The instance was not initialized";
  }

  return_object = res.send({
    status: sucesso,
    message: mensagemretorno,
  });
});

app.post("/sendmessage", async function (req, res) {
  console.log(req.body);
  //parametros vindos na requisição ... parameters coming in the request
  var telnumber = req.body.telnumber; // formato deve ser igual a esta 5516991838523
  var mensagemparaenvio = req.body.message;
  var isgroup = req.body.isgroup; //se é grupo ou não ... if is group or not

  var mensagemretorno = ""; //mensagem de retorno da requisição ... request return message
  var sucesso = false; //Se houve sucesso na requisição ... If the request was successful

  if (typeof WppClient === "object") {
    // Validando se a lib está iniciada .... Validating if lib is started
    let status = await WppClient.getConnectionState(); // validadado o estado da conexão com o whats //whats connection status validated
    console.log(status);
    if (status === "CONNECTED") {
      if (isgroup == "false") {
        let numeroexiste = await WppClient.checkNumberStatus(
          telnumber + "@c.us"
        ); //Validando se o número existe ... Validating if the number exists
        if (numeroexiste.canReceiveMessage === true) {
          await WppClient.sendText(
            numeroexiste.id._serialized,
            mensagemparaenvio
          )
            .then((result) => {
              console.log("Result: ", result); //return object success
              sucesso = true;
              mensagemretorno = result.id;
            })
            .catch((erro) => {
              console.error("Error when sending: ", erro); //return object error
            });
        } else {
          mensagemretorno =
            "O numero não está disponível ou está bloqueado - The number is not available or is blocked.";
        }
      } else {
        await WppClient.sendText(telnumber + "@g.us", mensagemparaenvio)
          .then((result) => {
            console.log("Result: ", result); //return object success
            sucesso = true;
            mensagemretorno = result.id;
          })
          .catch((erro) => {
            console.error("Error when sending: ", erro); //return object error
          });
      }
    } else {
      mensagemretorno =
        "Valide sua conexao com a internet ou QRCODE - Validate your internet connection or QRCODE";
    }
  } else {
    mensagemretorno =
      "A WppClient não foi inicializada - The instance was not initialized";
  }

  res.send({
    status: sucesso,
    message: mensagemretorno,
  });
});

startWPP(); //chama a função para inicializar a lib...... call function to initialize the lib

async function startWPP() {
  await wppconnect
    .create({
      session: "WathsApp-Matheus",
      catchQR: (base64Qr, asciiQR, attempts, urlCode) => {},
      statusFind: async (statusSession, session) => {
        console.log("Status Session: ", statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
        //Create session wss return "serverClose" case server for close
        console.log("Session name: ", session);

        /*if (statusSession === "inChat") {
          if (WppClient.isConnected()) {
            WppClient.getAllContacts().then((chats) => {
              chats.forEach((chat) => {
                if (!chat.isUser) console.log(chat, "lista");
              });
            }); // esta funcionando
            
            WppClient.getChatById('5516981546916-1462187883@g.us').then(chats => console.log(chats,'chat'));
            console.log(await WppClient.checkNumberStatus('5516981546916-1462187883@g.us'),'status');
          }
        }*/
      },
      headless: true, // Headless chrome
      devtools: false, // Open devtools by default
      useChrome: true, // If false will use Chromium instance
      debug: false, // Opens a debug session
      logQR: true, // Logs QR automatically in terminal
      browserWS: "", // If u want to use browserWSEndpoint
      browserArgs: [""], // Parameters to be added into the chrome browser instance
      puppeteerOptions: {}, // Will be passed to puppeteer.launch
      disableWelcome: false, // Option to disable the welcoming message which appears in the beginning
      updatesLog: true, // Logs info updates automatically in terminal
      autoClose: 60000, // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
      tokenStore: "file", // Define how work with tokens, that can be a custom interface
      folderNameToken: "./tokens", //folder name when saving tokens
    })
    .then(async (client) => {
      start(client);
    })
    .catch((erro) => console.log(erro));
}

async function start(client) {
  WppClient = client; //Será utilizado nas requisições REST ..... It will be used in REST requests

  client.onMessage(async (message) => {});

  client.onAck(async (ack) => {});

  client.onStateChange(async (state) => {});
}

const porta = "8200";
var server = app.listen(porta);
console.log("Servidor iniciado na porta %s", server.address().port);
