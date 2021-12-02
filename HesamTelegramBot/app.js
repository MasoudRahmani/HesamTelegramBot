'use strict';
/* -----------------  TEXT ----------------*/
var person = { 'firstname': '','lastname': '', 'country': '', 'number': '', 'question': '' };

const welcome =
    "باسلام!\r\n\پیش از بیان پرسش خود، لطفا به چند سوال کوتاه پاسخ دهید و سپس پرسش خود را مطرح فرمایید.\r\n\
    همکاران ما در اسرع وقت پاسخگوی پرسش شما خواهند بود.\r\n\
    باتشکر";
const firstnameQu = `نام؟`;
const lastnameQu = `نام خانوادگی؟`;
var countryQu = `سرکار آقای/خانم XXXX خوش آمدید. کشور کنونی در حال سکونت؟`;
const numberQu = `لطفا شماره تماس خود را وارد فرمایید.`;
const wrongNumebr = `شماره همراه اشتباه می باشد، لطفا دوباره تلاش فرمایید.`;
const finalEntry = `باتشکر، لطفا متن استفتا خود را مطرح نمایید.`;
const doneText = 'در صورت اطمینان دکمه ی پایان را فشار دهید.\nدر غیر اینصورت دوباره مراحل را طی فرمایید.';
const endButtonText = 'پایان';
/*---------------- Import ------------------*/
const TeleBot = require('telebot');

/*---------------- Main ---------------------*/
const bot = new TeleBot({
    token: '',

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


bot.on('/start', msg => {
    const id = msg.from.id;
    msg.reply.text(welcome);
    return bot.sendMessage(id, firstnameQu, { ask: 'lastname' });
});
bot.on('ask.lastname', msg => {
    const id = msg.from.id;
    person.firstname = msg.text;
    return bot.sendMessage(id, lastnameQu, { ask: 'name' });
});
bot.on('ask.name', msg => {
    const id = msg.from.id;
    //_name = msg.text;
    person.lastname = msg.text;
    countryQu = countryQu.replace('XXXX', person.firstname + ' ' + person.lastname);
    return bot.sendMessage(id, countryQu, { ask: 'country' });
});
bot.on('ask.country', msg => {
    const id = msg.from.id;
    //_country = msg.text;
    person.country = msg.text;
    return bot.sendMessage(id, numberQu, { ask: 'number' });

});
bot.on('ask.number', msg => {
    const id = msg.from.id;
    //_number = msg.text;
    person.number = msg.text;
    if (!person.number)
        return bot.sendMessage(id, wrongNumebr, { ask: 'number' });
    else
        return bot.sendMessage(id, finalEntry, { ask: 'end' });

});
bot.on('ask.end', msg => {
    //_question = msg.text;
    person.question = msg.text;
    const replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton(endButtonText, { callback: 'done' })
        ]
    ]);
    return bot.sendMessage(msg.from.id, doneText, { replyMarkup });

});
//ارسال داده ی نهایی برای ادمین
bot.on('callbackQuery', (msg) => {
    console.log('callbackQuery data:', person);

});


bot.start();