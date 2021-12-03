'use strict';
/*---------------- Import ------------------*/
const http = require('http');
const TeleBot = require('telebot');

/*-------------- heroku port --------------*/
const server = http.createServer((rq, rs) => { rs.writeHead(200); rs.end('we have nothing here. Bot. +11'); });
server.listen(process.env.PORT || 5000);
/* -----------------  var ----------------*/
const adminId = '-1001532265592';
class person {
    constructor(id, username, name, country, field, number, ques) {
        this._id = id; this._name = name || ''; this._country = country || ''; this._field = field | '';
        this._number = number || ''; this._question = ques || ''; this._user_telusername = username || '';
    }
};
var persons = [];

const commands = { start: '/start', help: '/help' };

const bot = new TeleBot({
    token: process.env.TelToken, //heroku config env

    polling: {
        interval: 500,
        limit: 100,
        retryTimeout: 2500
    },
    usePlugins: ['askUser'],
    pluginFolder: '../plugins/', // Optional. Plugin folder location.
    pluginConfig: { // Optional. Plugin configuration.
        // myPluginName: {
        //   data: 'my custom value'
        // }
    }
})

/* -----------------  TEXT ----------------*/
const welcome =
    "باسلام!\r\n\پیش از بیان پرسش خود، لطفا به چند سوال کوتاه پاسخ دهید و سپس پرسش خود را مطرح فرمایید.\r\n\
    همکاران ما در اسرع وقت پاسخگوی پرسش شما خواهند بود.\r\n\
    باتشکر";
const nameQu = `نام و نام خانوادگی؟`;
const countryQu = `سرکار آقای/خانم XXXX خوش آمدید. کشور کنونی در حال سکونت؟`;
const numberQu = `لطفا شماره همراه خود را بدون صفر وارد فرمایید.`;
//const wrongNumebr = `شماره همراه اشتباه می باشد، لطفا دوباره تلاش فرمایید.`;
const finalEntry = `باتشکر، لطفا متن استفتا خود را مطرح نمایید.`;
const doneText = 'در صورت اطمینان دکمه ی پایان را فشار دهید.\nدر غیر اینصورت دوباره مراحل را طی فرمایید.';
const endButtonText = 'پایان';
const startButtonText = 'شروع';
const workQu = 'لطفا شغل خود را وارد فرمایید.';
const help = 'پس از آغاز فرآیند ایجاد درخواست استفتا، اطلاعات درخواست شده را تکمیل کنید تا پرسش شما جهت پاسخگویی به دست همکاران ما برسد.\n\
شما میتونید با نوشتن /start یا استفاده از دکمه ی کنار ارسال، این فرآیند را آغاز فرمایید.\n\
باتشکر';

/*---------------- events ---------------------*/

bot.on(commands.start, msg => {
    let tmp_id = msg.from.id;
    if (persons.findIndex(x => x._id == tmp_id) == -1) {
        let p = new person(tmp_id);
        persons.push(p);
    }
    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton(startButtonText, { callback: 'start' })
        ]
    ]);
    return bot.sendMessage(tmp_id, welcome, { replyMarkup });
});
bot.on('ask.start', msg => {
    return bot.sendMessage(msg.from.id, nameQu, { ask: 'name' });
});

bot.on('ask.name', msg => {
    if( IsIt_A_command(msg.text) ) return;

    let id = msg.from.id;
    let pos = persons.findIndex(x => x._id == id);

    persons[pos]._name = msg.text;

    let tmp = countryQu.replace('XXXX', msg.text);
    return bot.sendMessage(id, tmp, { ask: 'country' });
});
bot.on('ask.country', msg => {
    if( IsIt_A_command(msg.text) ) return;

    let id = msg.from.id;
    let pos = persons.findIndex(x => x._id == id);
    persons[pos]._country = msg.text;

    return bot.sendMessage(id, numberQu, { ask: 'number' });

});
bot.on('ask.number', msg => {
    if( IsIt_A_command(msg.text) ) return;

    let id = msg.from.id;
    let tmp = msg.text;
    //https://stackoverflow.com/questions/22378736/regex-for-mobile-number-validation/22378975
    //if (tmp.search(/^(\+\d{1,3}[- ]?)?\d{10}$/) == -1)
    //    return bot.sendMessage(id, wrongNumebr, { ask: 'number' });
    //else {
    let pos = persons.findIndex(x => x._id == id);
    persons[pos]._number = tmp;
    return bot.sendMessage(id, workQu, { ask: 'field' });
    // }

});

bot.on('ask.field', msg => {
    if( IsIt_A_command(msg.text) ) return;

    let id = msg.from.id;
    let pos = persons.findIndex(x => x._id == id);
    persons[pos]._field = msg.text;
    return bot.sendMessage(id, finalEntry, { ask: 'end' });
})
bot.on('ask.end', msg => {
    if( IsIt_A_command(msg.text) ) return;

    let id = msg.from.id;
    let pos = persons.findIndex(x => x._id == id);
    persons[pos]._question = msg.text;
    persons[pos]._user_telusername = msg.from.username;

    let replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton(endButtonText, { callback: 'done' })
        ]
    ]);
    return bot.sendMessage(id, doneText, { replyMarkup });

});

bot.on('callbackQuery', (msg) => {
    let id = msg.from.id;
    if (msg.data == 'start') {
        return bot.sendMessage(id, nameQu, { ask: 'name' });
    }
    else
    //ارسال داده ی نهایی برای ادمین
    {
        let pos = persons.findIndex(x => x._id == id);
        bot.sendMessage(adminId, `\
        TelegramID: @${typeof persons[pos]._user_telusername != 'undefined' ? persons[pos]._user_telusername : ' ندارد '} \n\
        Name:    ${persons[pos]._name} \n\
        Country:    ${persons[pos]._country} \n\
        Number:    ${persons[pos]._number} \n\
        Work Field:    ${persons[pos]._field} \n\
        Question:    ${persons[pos]._question}`);

    }
});

bot.on( commands.help, msg => {
    msg.reply.text(help);
});

/*---------------- Functions ---------------------*/

// if used command in middle of conversation, we need to know
function IsIt_A_command(txt){
    let key ;
    for(key in commands)
    {
        if( commands[key] == txt )
        return true;
    }
    return false;
}
/*---------------- Main ---------------------*/
bot.start();