const mineflayer = require('mineflayer')
const express = require('express')

// Render.com'un botu 7/24 aktif tutabilmesi için Express web sunucusu
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Minecraft AFK Botu Aktif!')
})

app.listen(PORT, () => {
  console.log(`[Web Servisi] HTTP sunucu ${PORT} portunda dinleniyor.`)
})

// Bot Konfigürasyonu
const BOT_CONFIG = {
  host: 'oyna.blokya.com', // Oynayacağınız Minecraft sunucusunun IP adresi
  port: 25565,
  username: 'qwerty452', // Kullanmak istediğiniz nick
  version: '1.21.11',
  password: 'botafk123'
}

let isRegistered = false // İlk kayıt yapıldı mı takibi

function startBot() {
  console.log(`[Bot] ${BOT_CONFIG.username} kullanıcı adıyla bağlanılıyor...`)
  
  const bot = mineflayer.createBot({
    host: BOT_CONFIG.host,
    port: BOT_CONFIG.port,
    username: BOT_CONFIG.username,
    version: BOT_CONFIG.version
  })

  // Sunucudaki tüm sohbet ve konsol mesajlarını terminale yazdırır
  bot.on('message', (jsonMsg) => {
    console.log(`[Sunucu Sohbeti] ${jsonMsg.toAnsi()}`)
  })

  // Bot oyuna doğduğunda (spawn)
  bot.on('spawn', () => {
    console.log('[Bot] Sunucuya giriş yapıldı/spawn olundu.')

    setTimeout(() => {
      if (!isRegistered) {
        console.log('[Bot] İlk kayıt işlemi yapılıyor (/register)...')
        bot.chat(`/register ${BOT_CONFIG.password} ${BOT_CONFIG.password}`)
        isRegistered = true
      } else {
        console.log('[Bot] Oturum açılıyor (/login)...')
        bot.chat(`/login ${BOT_CONFIG.password}`)
      }

      // Giriş işlemlerinden sonra lobideyken /afk komutunu çalıştırma
      setTimeout(() => {
        console.log('[Bot] /afk komutu gönderiliyor...')
        bot.chat('/afk')
      }, 5000)

    }, 3000) // Sunucuya yüklendikten 3 saniye sonra komutları gönderir

    // Sunucudan AFK sebebiyle atılmamak için her 3 dakikada bir küçük hareket
    setInterval(() => {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 500)
    }, 180000)
  })

  // Bağlantı koparsa veya düşerse otomatik tekrar bağlan
  bot.on('end', (reason) => {
    console.log(`[Bot] Bağlantı koptu (${reason}). 10 saniye sonra tekrar deneniyor...`)
    setTimeout(startBot, 10000)
  })

  bot.on('error', (err) => {
    console.log('[Bot Hatası]', err)
  })
}

startBot()
