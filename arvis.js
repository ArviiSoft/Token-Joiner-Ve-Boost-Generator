const chalk = require("chalk");

process.on("unhandledRejection", (reason, promise) => {
  console.log(`${chalk.redBright("[HATA]")} Hata: ${promise} - Sebep: ${reason}`);
});

process.on("uncaughtException", (err, origin) => {
  console.log(`${chalk.redBright("[HATA]")} ${err} ( ${origin} )`);
});

const gradient = require("gradient-string")
const ayarlar = require('./ayarlar.json');
const { Client } = require("discord.js-selfbot-v13")

var totalJoined = 0
var failed = 0
var invite = ayarlar.inviteCode
if (invite.includes(".")) {
  inviteCode = invite.match(/\/([^/]+)$/)?.[1] || ""
} else {
  inviteCode = invite
}

const HttpsProxyAgent = require("https-proxy-agent")
const fs = require("fs")

console.log(gradient.rainbow("arviis. - Token Joiner"))

async function readTokens() {
  const tokens = fs.readFileSync("tokens.txt").toString().split("\n")

  for (i in tokens) {
    await new Promise((resolve) => setTimeout(resolve, i * ayarlar.joinDelay))
    doEverything(
      tokens[i]?.trim()?.replace("\r", "")?.replace("\n", ""),
      tokens
    )
  }
}
readTokens()
const proxies = fs.readFileSync("proxies.txt").toString().split("\n")

async function doEverything(token, tokens) {
  // console.log(token);
  const randomProxy = proxies[Math.floor(Math.random() * proxies.length)]
    ?.replace("\r", "")
    ?.replace("\n", "")
  var client

  if (ayarlar.useProxies) {
    var agent = HttpsProxyAgent(randomProxy)
    client = ayarlar.captcha_api_key
      ? new Client({
          captchaService: ayarlar.captcha_service.toLowerCase(),
          captchaKey: ayarlar.captcha_api_key,
          checkUpdate: false,
          restWsBridgeTimeout: 5 * 1000,
        })
      : new Client({ checkUpdate: false })
  }

  client.on("ready", async () => {
    console.log(
      chalk.green("[TOKEN AKTİF] ") + gradient.cristal(client.user.tag))

    await client
      .fetchInvite(inviteCode)
      .then(async (invite) => {
        await invite
          .acceptInvite(true)
          .then(async () => {console.log(chalk.greenBright(`[TOKEN SUNUCUYA GİRDİ] - ${gradient.passion(client.user.tag)}`))
            totalJoined++
            process.title = `Başarılı: ${totalJoined} | Başarısız: ${failed}`

            if (ayarlar.boost.enabled) {
              setTimeout(async () => {
                const allBoosts = await client.billing.fetchGuildBoosts()

                allBoosts.each(async (boost) => {
                  await boost.unsubscribe().catch((err) => {})
                  setTimeout(async () => {
                    await boost.subscribe(ayarlar.boost.serverId)
                  }, 50000000)})
              }, ayarlar.boost.delay
            )}
          })

          .catch((err) => {
            console.log(`${chalk.redBright("[HATA]")} ${gradient.fruit(client.user.tag)} Adlı token sunucuya giremedi.`);
            failed++
            process.title = `Başarılı: ${totalJoined} | Başarısız: ${failed}`

            console.error(chalk.redBright(err))
})
      })

      .catch((err) => {
        if (err.toString().includes("Bilinmeyen Davet"))
          return console.log(`${chalk.redBright("[HATA]")} ( ${inviteCode} ) davet linki hatalı veya yanlış.`)
        console.error(err)})
  })
}