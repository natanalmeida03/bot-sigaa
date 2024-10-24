const puppeteer = require("puppeteer");

const loginSigaa = ""; // seu login do sigaa
const senhaSigaa = ""; // sua senha do sigaa

const materias = ["FGA0053"]; // coloque sem espacos o nome, codigo ou os dois no formato "codige - nomeDaMateria"

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Acesse a página de login
  await page.goto(
    "https://autenticacao.unb.br/sso-server/login?service=https://sig.unb.br/sipac/login/cas"
  );

  // Preenche os campos de login e senha
  await page.type('input[name="username"]', loginSigaa);
  await page.type('input[name="password"]', senhaSigaa);

  // Clica no botão de login e espera pela navegação
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[class="btn-login cursor-pointer opacity-1 col-5"]'),
  ]);

  // // Verifica se o login foi bem-sucedido
  // const response = await page.waitForResponse((response) =>
  //   response.url().includes("sig.unb.br")
  // );

  // if (!response.ok()) {
  //   console.log("Erro ao logar");
  //   return;
  // }

  //Fecha o aviso de cookies, se aparecer
  const cookieButton = await page.$("#sigaa-cookie-consent > button");
  if (cookieButton) {
    await cookieButton.click();
  }

  // // Navega até a página de matrícula
  await page.hover("td.ThemeOfficeMainItem:nth-child(1)");
  await page.hover("tr.ThemeOfficeMenuItem:nth-child(13) > td:nth-child(2)");
  await page.hover(
    "#cmSubMenuID3 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)"
  );

  // // Clica para navegar até a página de matrícula
  await Promise.all([
    page.waitForNavigation(),
    page.click(
      "#cmSubMenuID3 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)"
    ),
  ]);

  // // Verifica se a navegação foi bem-sucedida
  // if (!response.ok()) {
  //   console.log("Erro ao navegar para selecionar página de matrícula");
  //   return;
  // }

  // // Seleciona a unidade e departamento
  await page.click("#form\\:checkUnidade");
  await page.select("#form\\:comboDepartamento", "673"); // fga

  // Busca pelas matérias
  await Promise.all([page.waitForNavigation(), page.click("#form\\:buscar")]);

  // // Verifica se cada matéria foi encontrada
  const searchInterval = setInterval(async () => {

    await Promise.all([page.waitForNavigation(), page.click("#form\\:buscar")]);

    let materiaEncontrada = false;

    for (const materia of materias) {
      materiaEncontrada = await page.evaluate((inputText) => {
        const regexPattern = new RegExp(inputText, "i");
        const elements = [...document.querySelectorAll("a")];
        const element = elements.find((el) => {
          const text = el.textContent.trim();
          return regexPattern.test(text);
        });
        return !!element;
      }, materia);

      if (materiaEncontrada) {
        console.log("Matéria encontrada: ", materia);
        break;
      } else {
        console.log("Matéria não encontrada: ", materia);
      }
    }

    // Se a matéria for encontrada, limpa o intervalo e encerra o browser
    if (materiaEncontrada) {
      clearInterval(searchInterval);
      await browser.close();
    }
  }, 10000);
})();
