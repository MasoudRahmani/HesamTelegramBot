'use strict';
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
/* -----------------  TEXT ----------------*/
class person {
    constructor(id, username, name, country, number, ques) {
        this._id = id; this._name = name || ''; this._country = country || '';
        this._number = number || ''; this._question = ques || ''; this._user_telusername = username || '';
    }
};
var persons = [];

const welcome =
    "باسلام!\r\n\پیش از بیان پرسش خود، لطفا به چند سوال کوتاه پاسخ دهید و سپس پرسش خود را مطرح فرمایید.\r\n\
    همکاران ما در اسرع وقت پاسخگوی پرسش شما خواهند بود.\r\n\
    باتشکر";
const nameQu = `نام و نام خانوادگی؟`;
const countryQu = `سرکار آقای/خانم XXXX خوش آمدید. کشور کنونی در حال سکونت؟`;
const numberQu = `لطفا شماره همراه خود را بدون صفر وارد فرمایید.`;
const wrongNumebr = `شماره همراه اشتباه می باشد، لطفا دوباره تلاش فرمایید.`;
const finalEntry = `باتشکر، لطفا متن استفتا خود را مطرح نمایید.`;
const doneText = 'در صورت اطمینان دکمه ی پایان را فشار دهید.\nدر غیر اینصورت دوباره مراحل را طی فرمایید.';
const endButtonText = 'پایان';
const startButtonText = 'شروع';
const help = 'پس از آغاز فرآیند ایجاد درخواست استفتا، اطلاعات درخواست شده را تکمیل کنید تا پرسش شما جهت پاسخگویی به دست همکاران ما برسد.\n\
شما میتونید با نوشتن /start یا استفاده از دکمه ی کنار ارسال، این فرآیند را آغاز فرمایید.\n\
باتشکر';
/*---------------- Import ------------------*/
const TeleBot = require('telebot');

/*---------------- Main ---------------------*/
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

/* ------------------ Start -------------------- */
bot.on('/start', msg => {
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
    let id = msg.from.id;
    let pos = persons.findIndex(x => x._id == id);

    persons[pos]._name = msg.text;

    let tmp = countryQu.replace('XXXX', msg.text);
    return bot.sendMessage(id, tmp, { ask: 'country' });
});
bot.on('ask.country', msg => {
    let id = msg.from.id;
    let pos = persons.findIndex(x => x._id == id);
    persons[pos]._country = msg.text;

    return bot.sendMessage(id, numberQu, { ask: 'number' });

});
bot.on('ask.number', msg => {
    let id = msg.from.id;
    let tmp = msg.text;
    //https://stackoverflow.com/questions/22378736/regex-for-mobile-number-validation/22378975
    if (tmp.search(/^(\+\d{1,3}[- ]?)?\d{10}$/) == -1)
        return bot.sendMessage(id, wrongNumebr, { ask: 'number' });
    else {
        let pos = persons.findIndex(x => x._id == id);
        persons[pos]._number = tmp;
        return bot.sendMessage(id, finalEntry, { ask: 'end' });
    }

});
bot.on('ask.end', msg => {
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
    if (msg.data == 'start') {
        let id = msg.from.id;
        return bot.sendMessage(id, nameQu, { ask: 'name' });
    }
    else
    //ارسال داده ی نهایی برای ادمین
    {
        console.log('callbackQuery data:', persons);
    }
});



bot.on('/help', msg => {
    msg.reply.text(help);
});
bot.start();