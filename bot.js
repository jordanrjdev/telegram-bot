const { Markup, Telegraf } = require("telegraf");
const axios = require("axios");
const fs = require("fs");
const youtubedl = require("youtube-dl");
const ffmpeg = require("ffmpeg");
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

function descargarVideo(url, name) {
  return new Promise((resolve, reject) => {
    const video = youtubedl(url, ["--format=18"], { cwd: __dirname });
    video.pipe(fs.createWriteStream(name + ".mp4"));
    video.on("end", function () {
      resolve(true);
    });
    video.on("error", function (err) {
      reject(err);
    });
  });
}
bot.action("mp3", (ctx) => {
  ctx.reply("Ingresa la url del video de yt");
  bot.on("text", async (context) => {
    try {
      let desc = await descargarVideo(
        context.message.text,
        context.from.first_name
      );
      if (desc) {
        let process = new ffmpeg(context.from.first_name + ".mp4");
        process.then(
          function (video) {
            video.fnExtractSoundToMP3(
              context.from.first_name + ".mp3",
              function (error, file) {
                console.log(error, file);
                if (!error) {
                  context.replyWithAudio({
                    source: fs.readFileSync(context.from.first_name + ".mp3"),
                  });
                } else {
                  context.reply("Hubo un error" + error);
                }
              }
            );
          },
          function (err) {
            context.reply(err);
          }
        );
      } else {
        context.reply("Error al descargar el mp3");
      }
    } catch (err) {
      console.log(err);
      context.reply("Error al descargar el mp3");
      context.reply("Error : ", err);
    }
  });
});

bot.action("mp4", (ctx) => {
  ctx.reply("Ingresa la url del video que deseas descargar");
  bot.on("text", async (context) => {
    try {
      let desc = await descargarVideo(
        context.message.text,
        context.from.first_name
      );
      if (desc) {
        context.replyWithVideo({
          source: fs.readFileSync(context.from.first_name + ".mp4"),
        });
      } else {
        context.reply("Hubo un error intenta de nuevo");
      }
    } catch (err) {
      console.log(err);
      context.reply("Hubo un error intenta de nuevo");
      context.reply("Error : ", err);
    }
  });
});

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
