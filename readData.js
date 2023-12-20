const axios = require("axios");
const cheerio = require("cheerio");
const { saveData, readData } = require("./src/data.io.js").io;

async function fetchTopics(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const Topicos = [];

    $("article > section").each((index, element) => {
      const topicDetail = {
        titulo: $(element).children("h2").text(),
        data: $(element).children("p[class=data]").text(),
        link: `http://sped.rfb.gov.br${$(element)
          .children("h2")
          .children("a")
          .attr("href")}`,
        new: 0,
      }; // ou alguma outra lógica de extração
      Topicos.push(topicDetail);
    });

    return Topicos;
  } catch (error) {
    console.error(`Ocorreu um erro ao buscar os tópicos: ${error.message}`);
  }
}

wgetSpedProjetos = async () => {
  const url = "http://sped.rfb.gov.br";
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const projetos = [];
  //console.log($('#conteudo > nav > ul > li:nth-child(1) > ul').html());

  $("#conteudo > nav > ul > li:nth-child(1) > ul")
    .children("li")
    .each((index, element) => {
      const projetoDetail = {
        nome: $(element).children("a").text(),
        url: `http://sped.rfb.gov.br/${$(element).children("a").attr("href")}`,
      };
      projetos.push(projetoDetail);
    });

  const dbProjetos = readData("dbProjetos");

  const diffProjs = [];
  projetos.forEach((proj) => {
    if (dbProjetos.find((dbPorj) => dbPorj.nome == proj.nome) == undefined) {
      diffProjs.push(proj);
    }
  });

  if (diffProjs.length > 0)
    saveData([...diffProjs, ...dbProjetos], "dbProjetos");
};

wgetTopicosByProjeto = async () => {
  const dbProjetos = readData("dbProjetos");
  dbProjetos.forEach(async (projeto) => {
    const topicos = await fetchTopics(projeto.url);
    const dbTopicos = readData(projeto.nome);

    const diffTopicos = [];
    topicos.forEach((topico) => {
      if (
        dbTopicos.find((dbTopico) => dbTopico.titulo == topico.titulo) ==
        undefined
      ) {
        topico.new = 1;
        diffTopicos.push(topico);
      }
    });

    if (diffTopicos.length > 0) {
      saveData([...diffTopicos, ...dbTopicos], projeto.nome);
    }
  });
};

setInterval(() => {
  wgetSpedProjetos();
  wgetTopicosByProjeto();
}, 100 * 60 * 100); //10 min
