const fs = require("fs");
const moment = require('moment-timezone');
const speed = require('performance-now');
const { color } = require('./lib/dfunctions');
const { newExif } = require('./lib/exif')
const { getGroupAdmins } = require('./lib/functions');
const horaBR = moment.tz('America/Sao_Paulo').format('HH:mm:ss');


module.exports = l = async (l, mek) => {
  try {

    //MAIN VARIABLES

    const from = mek.key.remoteJid;
    const budy = (mek.mtype === 'conversation') ? mek.message.conversation : (mek.mtype === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
    const body = (mek.mtype === 'conversation' && mek.message.conversation) ? mek.message.conversation : (mek.mtype == 'imageMessage') && mek.message[mek.mtype].caption ? mek.message[mek.mtype].caption : (mek.mtype == 'videoMessage') && mek.message[mek.mtype].caption ? mek.message[mek.mtype].caption : (mek.mtype == 'extendedTextMessage') && mek.message[mek.mtype].text ? mek.message[mek.mtype].text : (mek.mtype == 'listResponseMessage') && mek.message[mek.mtype].singleSelectReply.selectedRowId ? mek.message.listResponseMessage.singleSelectReply.selectedRowId : (mek.mtype == 'templateButtonReplyMessage') ? mek.message.templateButtonReplyMessage.selectedId : (mek.mtype === 'messageContextInfo') ? mek.message[mek.mtype].singleSelectReply.selectedRowId : (mek.mtype == 'l.sendMessageButtonMessage') && mek.message[mek.mtype].selectedButtonId ? mek.message[mek.mtype].selectedButtonId : (mek.mtype == 'stickerMessage') && ((mek.message[mek.mtype].fileSha256.toString('base64')) !== null && (mek.message[mek.mtype].fileSha256.toString('base64')) !== undefined) ? (mek.message[mek.mtype].fileSha256.toString('base64')) : "" || mek.message[mek.mtype]?.selectedButtonId || "";
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(" ");
    const quo = (mek.quoted || mek);
    const quoted = (quo.mtype == 'buttonsMessage') ? quo[Object.keys(quo)[1]] : (quo.mtype == 'templateMessage') ? quo.hydratedTemplate[Object.keys(quo.hydratedTemplate)[1]] : (quo.mtype == 'product') ? quo[Object.keys(quo)[0]] : mek.quoted ? mek.quoted : mek
    const qmsg = (quoted.msg || quoted)
    const mime = (quoted.msg || quoted).mimetype || ''
    const prefix = /^[°•π÷×¶∆£¢€¥®™=|~!#$%^&.?/\\©^z+*,;]/.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™=|~!#$%^&.?/\\©^z+*,;]/gi) : '.';
    const isGroup = from.endsWith('@g.us');
    const groupMetadata = isGroup ? await l.groupMetadata(from) : '';
    const participants = isGroup ? await groupMetadata?.participants : [];
    const participantsID = isGroup ? participants?.map(a => a.id) : []
    const botNumber = await l.decodeJid(l.user.id);
    const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmin = isGroup ? groupAdmins.includes(mek.sender) : false;
    const groupOwner = isGroup ? groupMetadata.owner : ''
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
    const sender = mek.sender;
    const groupName = isGroup ? groupMetadata.subject : '';
    const pushname = mek.pushName || "";

    //CONSOLE

    if (isCmd && isGroup) console.log(color("[", "white") + color(" CMD 🛠️", "orange") + color("]", "white") + color(" - GP 👥 -", "white") + color(" RECEBIDO AS ", "white") + color(horaBR, "blue") + color(" ENVIADO NO GRUPO ", "white") + color(groupName, "blue") + color(" POR ", "white") + color(mek.sender.split("@")[0] + ` (${pushname})`, "blue") + ' ' + color(body.substring(0, 10), "yellow") + ' ' + color(`COMANDO ATRAVES DE `, "white") + color(mek.mtype, "yellow"));
    if (!isCmd && isGroup) console.log(color("[", "white") + color(" MSG 💬 ", "green") + color("]", "white") + color(" - GP 👥 -", "white") + color(" RECEBIDA AS ", "white") + color(horaBR, "blue") + color(" ENVIADO NO GRUPO ", "white") + color(groupName, "blue") + color(" POR ", "white") + color(mek.sender.split("@")[0] + ` (${pushname})`, "blue") + ' ' + color(mek.mtype, "yellow") + ' ' + color(mek.mtype != "stickerMessage" ? body.substring(0, 10) : "", "white"))
    if (isCmd && !isGroup) console.log(color("[", "white") + color(" CMD 🛠️", "orange") + color("]", "white") + color(" - PV 👤 -", "white") + color(" RECEBIDO AS ", "white") + color(horaBR, "blue") + color(" ENVIADO POR ", "white") + color(mek.sender.split("@")[0] + ` (${pushname})`, "blue") + ' ' + color(body, "yellow") + color(` COMANDO ATRAVES DE `, "white") + color(mek.mtype, "yellow"))
    if (!isCmd && !isGroup) console.log(color("[", "white") + color(" MSG 💬 ", "green") + color("]", "white") + color(" - PV 👤 -", "white") + color(" RECEBIDA AS ", "white") + color(horaBR, "blue") + color(" ENVIADO POR ", "white") + color(mek.sender.split("@")[0] + ` (${pushname})`, "blue") + ' ' + color(mek.mtype, "yellow") + ' ' + color(mek.mtype != "stickerMessage" ? body.substring(0, 10) : "", "white"))

    //COMMANDS

    switch (command) {

      //#INFO & TESTING

      case 'ping':
        let timestamp = speed()
        let latensi = speed() - timestamp
        l.sendFooterReaction(from, `_*Ping 🏓*_`, `*Speed: ${latensi.toFixed(4)} _segundos_*`, mek, mek, `⏱️`)
        break;

      case 'mek':
        l.reply(from, JSON.stringify(mek.message, null, 3), mek);
        break;

      case 'owner': case 'creator':
        templateButtons = [
          { index: 1, urlButton: { displayText: 'WHATSAPP', url: 'https://api.whatsapp.com/send/?phone=553195703379' } },
          { index: 2, callButton: { displayText: 'NÚMERO', phoneNumber: '+55 31 99570-3379' } },
        ]
        l.send5But(from, `*Opções para contactar o meu criador*`, `selecione uma das opções abaixo`, templateButtons)
        break;

      case 'menu': case 'comandos': case 'features':
        l.menuList(from, mek)
        break


      //#ADMIN FEATURES  

      case 'delete': case 'del':
        if (!mek.quoted) return l.reply(from, `*Para usar este comando você deve marcar alguma mensagem*`, mek)
        if (!isGroup && !mek.quoted.fromMe) return l.reply(from, `*Para usar este comando você deve marcar uma mensagem minha*`, mek)
        if (!isBotAdmins && !mek.quoted.fromMe) return l.reply(from, `*Para usar este comando o bot deve ser um dos admins*`, mek)
        if (!isGroup && !isAdmin) return l.reply(from, `*Para usar este comando você deve ser um dos admins*`, mek)
        l.sendMessage(from, { delete: { remoteJid: from, id: mek.quoted.id, participant: mek.quoted.sender } })
        break;

      case 'linkgp': case 'linkgroup':
        if (!isGroup) return l.reply(from, `*Este comando so pode ser utilizado em grupos*`, mek)
        if (!isBotAdmins) return l.reply(from, `*Para usar este comando o bot deve ser um dos admins*`, mek)
        if (!isAdmin) return l.reply(from, `*Para usar este comando você deve ser um dos admins*`, mek)
        let response = await l.groupInviteCode(from)
        l.reply(from, `*Link do grupo ${groupName}*\n\n*https://chat.whatsapp.com/${response}*`, mek)
        break;

      case 'hidetag':
        if (!isGroup) return l.reply(from, `*Este comando so pode ser utilizado em grupos*`, mek)
        if (!isAdmin) return l.reply(from, `*Para usar este comando você deve ser um dos admins*`, mek)
        l.sendMessage(from, { text: q ? q : '', mentions: participants.map(a => a.id) }, { quoted: mek })
        break;

      case 'ban': case 'kick':
        users = mek.mentionedJid[0] ? mek.mentionedJid[0] : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (!isGroup) return l.reply(from, `*Este comando so pode ser utilizado em grupos*`, mek)
        if (!isBotAdmins) return l.reply(from, `*Para usar este comando o bot deve ser um dos admins*`, mek)
        if (!isAdmin) return l.reply(from, `*Para usar este comando você deve ser um dos admins*`, mek)
        if (users == groupOwner) return l.reply(from, `*Não posso banir o dono do grupo*`, mek)
        action = await l.groupParticipantsUpdate(from, [users], 'remove')
        if (action[0].status == 200) return l.mreply(from, `*De acordo com as ordens do admin @${mek.sender.split('@')[0]}, bani o @${users.split('@')[0]} do grupo*`, mek, [mek.sender, users])
        else l.reply(from, `Obtive um erro ao tentar remover o usuario`)
        break;

      case 'add':
        users = mek.mentionedJid[0] ? mek.mentionedJid[0] : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (!isGroup) return l.reply(from, `*Este comando so pode ser utilizado em grupos*`, mek)
        if (!isBotAdmins) return l.reply(from, `*Para usar este comando o bot deve ser um dos admins*`, mek)
        if (!isAdmin) return l.reply(from, `*Para usar este comando você deve ser um dos admins*`, mek)
        if (participantsID.includes(users)) return l.mreply(from, `*O @${users.split('@')[0]} já está no grupo*`, mek, [mek.sender, users])
        action = await l.groupParticipantsUpdate(from, [users], 'add')
        if (action[0].status == 403) return l.mreply(from, `*Aparentemente o @${users.split('@')[0]} privou quem pode o adicionar em grupos*`, mek, [users])
        if (action[0].status == 200) return l.mreply(from, `*De acordo com as ordens do admin @${mek.sender.split('@')[0]} adicionei o @${users.split('@')[0]} ao grupo*`, mek, [mek.sender, users])
        else l.reply(from, `Obtive um erro ao tentar adicionar o usuario`)
        break;

      case 'promote':
        users = mek.mentionedJid[0] ? mek.mentionedJid[0] : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (!isGroup) return l.reply(from, `*Este comando so pode ser utilizado em grupos*`, mek)
        if (!isBotAdmins) return l.reply(from, `*Para usar este comando o bot deve ser um dos admins*`, mek)
        if (!isAdmin) return l.reply(from, `*Para usar este comando você deve ser um dos admins*`, mek)
        if (groupAdmins.includes(users)) return l.mreply(from, `*O @${users.split('@')[0]} já é um dos admins*`, mek, [users])
        action = await l.groupParticipantsUpdate(from, [users], 'promote')
        if (action[0].status == 200) return l.mreply(from, `*O @${users.split('@')[0]} acaba de se tornar o nosso mais novo admin*`, mek, [users])
        else l.reply(from, `Obtive um erro ao tentar promover o usuario`)
        break;

      case 'demote':
        users = mek.mentionedJid[0] ? mek.mentionedJid[0] : mek.quoted ? mek.quoted.sender : q.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (!isGroup) return l.reply(from, `*Este comando so pode ser utilizado em grupos*`, mek)
        if (!isBotAdmins) return l.reply(from, `*Para usar este comando o bot deve ser um dos admins*`, mek)
        if (!isAdmin) return l.reply(from, `*Para usar este comando você deve ser um dos admins*`, mek)
        if (!groupAdmins.includes(users)) return l.mreply(from, `*O @${users.split('@')[0]} não é um dos admins*`, mek, [users])
        action = await l.groupParticipantsUpdate(from, [users], 'demote')
        if (action[0].status == 200) return l.mreply(from, `*O @${users.split('@')[0]} acabou de voltar a ser um membro comum*`, mek, [users])
        else l.reply(from, `Obtive um erro ao tentar demitir o usuario`)
        break;


      //#FUN FEATURES  

      case 'sticker': case 'figurinha': case 'f': case 's':
        if (!quoted) l.reply(from, `*Para usar esse comando marque uma imagem ou um video de até 10 segundos*`, mek)
        if (/image/.test(mek.quoted ? mek.quoted.mimetype : mek.mimetype)) {
          let media = await l.downloadMediaMessage(qmsg)
          let encmedia = await l.sendImageAsSticker(from, media, `f`, mek, { packname: `Zuri`, author: `BOT` })
          await fs.unlinkSync(encmedia)
        } else if (/video/.test(mek.quoted ? mek.quoted.mimetype : mek.mimetype)) {
          if (qmsg.seconds > 10) return l.reply(from, `*Para usar esse comando marque uma imagem ou um video de até 10 segundos*`, mek)
          let media = await l.downloadMediaMessage(qmsg)
          let encmedia = await l.sendVideoAsSticker(from, media, `f`, mek, { packname: `Zuri`, author: `BOT` })
          await fs.unlinkSync(encmedia)
        } else {
          l.reply(from, `*Para usar esse comando marque uma imagem ou um video de até 10 segundos*`, mek)
        }
        break

      case 'st': case 's2': case 'f2':
        if (!quoted) return l.reply(from, `*Para usar esse comando marque uma imagem ou um video de até 10 segundos*`, mek)
        if (/image/.test(mek.quoted ? mek.quoted.mimetype : mek.mimetype)) {
          let media = await l.downloadMediaMessage(qmsg)
          let encmedia = await l.sendImageAsSticker(from, media, `st`, mek, { packname: `Zuri`, author: `BOT` })
          await fs.unlinkSync(encmedia)
        } else if (/video/.test(mek.quoted ? mek.quoted.mimetype : mek.mimetype)) {
          if (qmsg.seconds > 10) return l.reply(from, `*Para usar esse comando marque uma imagem ou um video de até 10 segundos*`, mek)
          let media = await l.downloadMediaMessage(qmsg)
          let encmedia = await l.sendVideoAsSticker(from, media, `st`, mek, { packname: `Zuri`, author: `BOT` })
          await fs.unlinkSync(encmedia)
        } else {
          l.reply(from, `*Para usar esse comando marque uma imagem ou um video de até 10 segundos*`, mek)
        }
        break

      case 'rename': case 'take':
        packname = q.split('|')[0]
        author = q.split('|')[1]
        if (!/webp/.test(mime)) return l.reply(from, `*Para usar esse comando marque uma figurinha*`, mek)
        let img = await l.downloadMediaMessage(qmsg)
        sticker = await newExif(img, packname || `Zuri-BOT`, author || '')
        l.sendMessage(from, { sticker: sticker }, { quoted: mek })
        break


      default:

        if (budy.includes('>>')) {
          var message = budy.slice(3);
          try {
            l.reply(from, JSON.stringify((eval(message)), null, 2), mek);
          } catch (e) {
            err = String(e);
            l.reply(from, err, mek);
          };
        }

    }
  } catch (e) {
    err = String(e);
    console.log("Error : %s",
      color(err, "red"));
  };
}

//AUTO UPDATE

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(color("[", "white") + color(" NEW UPDATE 🔄 ", "green") + color("]", "white") + color(` NOVAS ATUALIZAÇÕES APLICADAS A `, "white") + color(__filename, "yellow"));
  delete require.cache[file];
  require(file);
});