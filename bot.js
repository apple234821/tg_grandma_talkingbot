var TelegramBot = require('node-telegram-bot-api');
var token = '1103013387:AAGPDw_nlsX5DMEaiIcQz_ctyGE_Hl63Y3o';

var bot = new TelegramBot(token, { polling: true });
//使用Long Polling的方式與Telegram伺服器建立連線

console.log('bot server started...');

//收到Start訊息時會觸發這段程式
bot.onText(/\/start/, (msg) => {
    let welcome_str = `${msg.from.first_name}乖孫欸~這麼久才想到來找阿嬤哦。這樣阿嬤要看心情才會回你~\n\n可能因為伺服器的關係，可能因為天氣不錯的關係，才有辦法回你。\n\n因為使用免費的伺服器及機器人的關係，30分鐘內沒有人呼叫我的話，伺服器會自動進入休眠~😈`;
    bot.sendMessage(msg.chat.id, welcome_str)

    if (!msg.from.username) {
        bot.sendMessage(msg.chat.id, "⚠️乖孫欸~啊你還沒設定【使用者名稱】，就是ID啦~趕快去設定一下吧~")
    }
});

// Command
bot.onText(/\/ping/, (msg) => {
    bot.sendMessage(msg.chat.id, "阿嬤還醒著~😗\n有好吃的要記得帶來給偶🤩");
});

// 傳訊息給管理員
bot.on('message', (msg) => {
    var admin_chatId = ['495732162','1066377622'] //管理員的ID['翰菥','郡嬿']
    var received_data = {
        id: msg.from.id,
        username: "@" + msg.from.username,
        name: msg.from.first_name + " " + msg.from.last_name,
        type: msg.chat.type,
        message: msg.text,
        sticker: msg.sticker,
        photo: msg.photo,
        messageid: msg.message_id
    }

    var send_text = `《ID》: ${received_data.id}\n《Username》: ${received_data.username}\n《Name》: ${received_data.name}\n《Type》: ${received_data.type}\n《Message》: ${received_data.message}\n《Sticker》: ${received_data.sticker}\n《Photo》: ${received_data.photo}\n《MessageId》:${received_data.messageid}`

    if (msg.from.id == admin_chatId) {
        // HanC傳的訊息
        if (msg.reply_to_message) {
            var data = msg.reply_to_message.text.split(`\n`)
            // 取使用者的ID
            let reply_id = data[0].split(":")
            reply_id = reply_id[1]
            reply_id = Number.parseInt(reply_id)

            // 取使用者的username
            let reply_username = data[1].split(":")
            reply_username = reply_username[1]

            // 取使用者的firstname
            let reply_name = data[2].split(":")
            reply_name = reply_name[1]

            // 取使用者的messageid
            let reply_messageid = data[7].split(":")
            reply_messageid = reply_messageid[1]
            reply_messageid = Number.parseInt(reply_messageid)

            var opts = {
                ReplyKeyboardHide: {},
                reply_to_message_id: reply_messageid,

                // force_reply讓使用者知道我們回覆的是哪句
                reply_markup: JSON.stringify({
                    "force_reply": true
                })
            };

            if (msg.text) {
                // 回覆給使用者
                bot.sendMessage(reply_id, msg.text, opts);

                // 管理員重新確認
                bot.sendMessage(admin_chatId, `回覆${reply_name}(${reply_username})\n\n內容為：${msg.text}`);
            }
            if (msg.sticker) {
                // 回覆給使用者
                bot.sendSticker(reply_id, msg.sticker.file_id, opts)

                // 管理員重新確認
                bot.sendMessage(admin_chatId, `回覆${reply_name}(${reply_username})\n\n內容為：${msg.sticker.emoji}`);
            }
        }
    } else {
        //其他人傳得訊息
        if (msg.reply_to_message) {
                var who_reply_what_text = `${msg.from.first_name}(@${msg.from.username}) 回覆你傳的這一句：${msg.reply_to_message.text}`
            
                var who_reply_what_sticker = `${msg.from.first_name}(@${msg.from.username}) 回覆你傳的這一個貼圖：${msg.reply_to_message.sticker.emoji}`

            bot.sendMessage(admin_chatId, who_reply_what_text)
            bot.sendMessage(admin_chatId, who_reply_what_sticker)
            bot.sendSticker(admin_chatId, msg.reply_to_message.sticker.file_id)
        }

        // 檢查是否為指令，接收使用者直接傳文字訊息
        if (msg.text) {
            var fdStart = msg.text.indexOf("/");
            if (fdStart == 0) {
                console.log("為「指令」，不回傳給管理員")
            } else if (fdStart == -1) {
                //別人的傳訊只傳給Hanc
                bot.sendMessage(admin_chatId, send_text);
            }
        }

        // 接收使用者直接傳貼圖
        if (msg.sticker) {
            bot.sendMessage(admin_chatId, send_text);
            bot.sendSticker(admin_chatId, msg.sticker.file_id)
        }
    }
})

// 檢查bug
bot.on("polling_error", (err) => console.log(err));

// 做聊天使用者列表、群發