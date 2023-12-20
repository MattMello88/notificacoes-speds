const axios = require("axios");
const { saveData, readData } = require("./src/data.io.js").io;
const dotenv = require("dotenv").config();

async function mandarMensagemWPP(Telelefone, isGroup, Msg) {
  axios
    .post("http://localhost:8200/sendmessage", {
      telnumber: Telelefone,
      isgroup: isGroup,
      message: Msg,
    })
    .then((response) => {
      //console.log(response);
    })
    .catch((error) => {
      console.log(error,'erro no envio de mensagem');
    });
}

async function webhookGoogleChat(text) {
  const url = dotenv.process.env.WEB_HOOK_GOOGLE_CHAT;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ text: text }),
  });
  return await res.json();
}

async function compareTopics() {
  readData("dbProjetos").forEach(async (projeto) => {
    const dbTopicos = readData(projeto.nome);

    dbTopicos.forEach(async (topico) => {
      if (topico.new == 1) {
        const text = `Voce tem uma atualização pendente. \n *${projeto.nome}:* \n ${topico.data} *"${topico.titulo}"* \n Acessar: ${topico.link}`;

        readData("dbCelulares").forEach(async (celular) => {
          await mandarMensagemWPP(celular.numero, celular.isGroup, text);
        });
        
        webhookGoogleChat(text).then(res => console.log(res));

        topico.new = 0;
      }
    });

    saveData(dbTopicos, projeto.nome);
  });
}

setInterval(() => {
  compareTopics();
}, 100 * 60 * 110); // 11minutos
