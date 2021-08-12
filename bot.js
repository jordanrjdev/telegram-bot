const { Markup, Telegraf } = require("telegraf");
const axios = require("axios");
const fs = require("fs");
const youtubedl = require("youtube-dl");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_API);

bot.start(async (ctx) => {
  await ctx.telegram.setMyCommands([
    {
      command: "/users",
      description: "Trae usuarios de una api y los muestra",
    },
    {
      command: "/downloadvideo",
      description: "Descarga un video de yt",
    },
    {
      command: "/getimage",
      description: "Envia una imagen aleatoria",
    },
    {
      command: "/generatepassword",
      description: "Generar una contraseña aleatoria",
    },
    {
      command: "/help",
      description: "Muestra la lista de comandos",
    },
  ]);
  ctx.reply(
    "Bienvenido al bot de jordan para ver la lista de comandos escribe /help"
  );
});

bot.command("users", (ctx) => {
  axios.get("https://jsonplaceholder.typicode.com/users").then((response) =>
    response.data.forEach((user) => {
      ctx.reply(user.name);
    })
  );
});

const keyboard = Markup.inlineKeyboard([
  Markup.button.url("Portafolio", "https://nadrojdev.xyz"),
  Markup.button.url("Instagram", "https://instagram.com/vednadroj"),
]);

bot.help(async (ctx) => {
  const commands = await ctx.telegram.getMyCommands();
  const info = commands.reduce(
    (acc, val) => `${acc}/${val.command} - ${val.description}\n`,
    ""
  );
  ctx.reply(info);
  ctx.reply("Quieres saber mas de Jordan", keyboard);
});

bot.command("getimage", (ctx) => {
  // pipe url contenttelegram
  ctx.replyWithPhoto({
    url: "https://picsum.photos/1920/1080/?random",
    filename: "image.jpg",
  });
});

bot.command("generatepassword", (ctx) => {
  let r = Math.random().toString(36);
  ctx.reply(`Contraseña generada : ${r}`);
});

bot.command("downloadvideo", (ctx) => {
  ctx.reply(
    "En que formato deseas descargarlo?",
    Markup.inlineKeyboard([
      Markup.button.callback("MP4", "mp4"),
      Markup.button.callback("MP3", "mp3"),
    ])
  );
});

function descargarVideo(url) {
  return new Promise((resolve, reject) => {
    youtubedl.exec(
      url,
      ["-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]"],
      {},
      function exec(err, output) {
        "use strict";
        if (!err) {
          console.log(output[2].split("] ")[1].split(".mp4")[0] + ".mp4");
          resolve(output[2].split("] ")[1].split(".mp4")[0] + ".mp4");
        }
        reject(err);
      }
    );
  });
}

function descargarMusica(url) {
  return new Promise((resolve, reject) => {
    youtubedl.exec(
      url,
      ["-x", "--audio-format", "mp3"],
      {},
      function exec(err, output) {
        if (!err) {
          resolve(output[4].split("Destination: ")[1]);
        }
        reject(err);
      }
    );
  });
}

bot.action("mp3", (ctx) => {
  ctx.reply("Ingresa la url del video de yt");
  bot.on("text", async (context) => {
    try {
      context.reply("Iniciando la descarga por favor espere");
      let desca = await descargarMusica(context.message.text);
      context.replyWithAudio({
        source: desca,
      });
    } catch (err) {
      context.reply(err.stderr);
    }
  });
});
bot.action("mp4", (ctx) => {
  ctx.reply("Ingresa la url del video que deseas descargar");
  bot.on("text", async (context) => {
    try {
      context.reply("Iniciando la descarga por favor espere");
      const descarga = await descargarVideo(context.message.text);
      context.replyWithVideo({
        source: fs.readFileSync(descarga),
      });
    } catch (err) {
      context.reply(err.stderr);
    }
  });
});

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
