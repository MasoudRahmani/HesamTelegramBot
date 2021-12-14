'use strict';
const TeleBot = require('telebot');

class person {
    constructor(id, username, name, country, field, number, ques) {
        this._id = id; this._name = name || ''; this._country = country || ''; this._field = field | '';
        this._number = number || ''; this._question = ques || ''; this._user_telusername = username || '';
    }
};
class _bot {
    #ppl = [];
    #token;
    #bot;
    #adminID;
    #tl;
    commands = { start: '/start', help: '/help' };

    constructor(token, admin, TL_provider) {
        this.#token = token;
        this.#adminID = admin;
        this.#tl = TL_provider;
    }
    Run() {
        this.#bot = new TeleBot({
            token: this.#token,
            polling: { interval: 500, limit: 100, retryTimeout: 2500 },
            usePlugins: ['askUser'], pluginFolder: '../plugins/'
        })
        this.#config();
        this.#bot.start();
    }
    #config() {
        //#region commands
        this.#bot.on(this.commands.help, msg => {
            msg.reply.text(this.#tl.translate('Help'));
        });
        this.#bot.on(this.commands.start, msg => {
            let tmp_id = msg.from.id;
            if (this.#ppl.findIndex(x => x._id == tmp_id) == -1) {
                let p = new person(tmp_id);
                this.#ppl.push(p);
            }
            let replyMarkup = this.#bot.inlineKeyboard([
                [
                    this.#bot.inlineButton(this.#tl.translate('startButtonText'), { callback: 'start' })
                ]
            ]);
            return this.#bot.sendMessage(tmp_id, this.#tl.translate('Welcome'), { replyMarkup });
        });
        this.#bot.on('callbackQuery', (msg) => {
            let id = msg.from.id;
            if (msg.data == 'start') {
                return this.#bot.sendMessage(id, this.#tl.translate('Name?'), { ask: 'name' });
            }
            else
            //ارسال داده ی نهایی برای ادمین
            {
                let pos = this.#ppl.findIndex(x => x._id == id);
                this.#bot.sendMessage(this.#adminID, `\
                TelegramID: @${typeof this.#ppl[pos]._user_telusername != 'undefined' ? this.#ppl[pos]._user_telusername : ' ندارد '} \n\
                Name:    ${this.#ppl[pos]._name} \n\
                Country:    ${this.#ppl[pos]._country} \n\
                Number:    ${this.#ppl[pos]._number} \n\
                Work Field:    ${this.#ppl[pos]._field} \n\
                Question:    ${this.#ppl[pos]._question}`);

            }
        });
        //#endregion

        this.#bot.on('ask.name', msg => {
            if (this.IsIt_A_command(msg.text)) return;

            let id = msg.from.id;
            let pos = this.#ppl.findIndex(x => x._id == id);

            this.#ppl[pos]._name = msg.text;
            //let tmp = countryQu.replace('XXXX', msg.text);

            return this.#bot.sendMessage(id, this.#tl.translate('Country?', { name: msg.text }), { ask: 'country' });
        });
        this.#bot.on('ask.country', msg => {
            if (this.IsIt_A_command(msg.text)) return;

            let id = msg.from.id;
            let pos = this.#ppl.findIndex(x => x._id == id);
            this.#ppl[pos]._country = msg.text;

            return this.#bot.sendMessage(id, this.#tl.translate('Number?'), { ask: 'number' });

        });
        this.#bot.on('ask.number', msg => {
            if (this.IsIt_A_command(msg.text)) return;

            let id = msg.from.id;
            let tmp = msg.text;
            //https://stackoverflow.com/questions/22378736/regex-for-mobile-number-validation/22378975
            //if (tmp.search(/^(\+\d{1,3}[- ]?)?\d{10}$/) == -1)
            //    return this.#bot.sendMessage(id, wrongNumebr, { ask: 'number' });
            //else {
            let pos = this.#ppl.findIndex(x => x._id == id);
            this.#ppl[pos]._number = tmp;
            return this.#bot.sendMessage(id, this.#tl.translate('Work?'), { ask: 'field' });
            // }

        });
        this.#bot.on('ask.field', msg => {
            if (this.IsIt_A_command(msg.text)) return;

            let id = msg.from.id;
            let pos = this.#ppl.findIndex(x => x._id == id);
            this.#ppl[pos]._field = msg.text;
            return this.#bot.sendMessage(id, this.#tl.translate('Question?'), { ask: 'end' });
        })
        this.#bot.on('ask.end', msg => {
            if (this.IsIt_A_command(msg.text)) return;

            let id = msg.from.id;
            let pos = this.#ppl.findIndex(x => x._id == id);
            this.#ppl[pos]._question = msg.text;
            this.#ppl[pos]._user_telusername = msg.from.username;

            let replyMarkup = this.#bot.inlineKeyboard([
                [
                    this.#bot.inlineButton(this.#tl.translate('endButtonText'), { callback: 'done' })
                ]
            ]);
            return this.#bot.sendMessage(id, this.#tl.translate('Finish'), { replyMarkup });

        });

    }
    // if used command in middle of conversation, we need to know
    IsIt_A_command(txt) {
        let key;
        for (key in this.commands) {
            if (this.commands[key] == txt)
                return true;
        }
        return false;
    }
}




module.exports = { _bot };