import fetch from "node-fetch";
import * as cheerio from "cheerio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function scrapeFlowGamesNews() {
  const url = "https://flowgames.gg/noticias/";

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const news = [];

    $("li").each((i, element) => {
      const title = $(element).find("h3 a").text().trim();
      const link = $(element).find("h3 a").attr("href");
      const author = $(element).find(".author").text().replace("Por ", "").trim();
      const date = $(element).find(".data").text().trim();

      if (title && link) {
        news.push({ title, link, author, date });
      }
    });

    return news;
  } catch (error) {
    console.error("Erro ao buscar as notícias:", error);
    return [];
  }
}

async function sendEmail(news) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  const emailContent = news
    .map((item) => 
      `${item.title}\n${item.link}\nAutor: ${item.author}\nData: ${item.date}\n`
    )
    .join("\n");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "marionetobeltrao@gmail.com",
    subject: "Flow Games",
    text: `Aqui estão as últimas notícias sobre os games ! :\n\n${emailContent}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
  }
}


async function main() {
  const news = await scrapeFlowGamesNews();
  if (news.length > 0) {
    await sendEmail(news);
  } else {
    console.log("Nenhuma notícia encontrada.");
  }
}

main();
