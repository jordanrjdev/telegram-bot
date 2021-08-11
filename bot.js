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
  ctx.reply("Ingresa la url del video que deseas descargar");
  bot.on("text", (context) => {
    const video = youtubedl(
      context.message.text,
      // Optional arguments passed to youtube-dl.
      ["--format=18"],
      // Additional options can be given for calling `child_process.execFile()`.
      { cwd: __dirname }
    );
    // Will be called when the download starts.
    video.on("info", function (info) {
      context.reply("Download started ", info._filename);
    });
    video.pipe(fs.createWriteStream(context.from.first_name + ".mp4"));

    video.on("complete", function complete(info) {
      context.reply("filename: " + info._filename + " already downloaded.");
    });

    video.on("end", function () {
      context.replyWithVideo({
        source: fs.readFileSync(context.from.first_name + ".mp4"),
      });
    });
  });
});

bot.launch();
process.on("uncaughtException", function (error) {
  console.log("\x1b[31m", "Exception: ", error, "\x1b[0m");
});

process.on("unhandledRejection", function (error, p) {
  console.log("\x1b[31m", "Error: ", error.message, "\x1b[0m");
});
