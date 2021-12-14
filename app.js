'use strict';
/*---------------- Import ------------------*/
const http = require('http');

const { default: localizify } = require('localizify');
const fa = require('./langs/fa.json');
const en = require('./langs/en.json');
const ar = require('./langs/ar.json');

const { _bot } = require('./bot');

/*-------------- heroku port --------------*/
const server = http.createServer((rq, rs) => { rs.writeHead(200); rs.end('we have nothing here. Bot. +14'); });
server.listen(process.env.PORT || 5000);

/*---------------- Main ---------------------*/
localizify.add('fa', fa).add('en',en).add('ar',ar);

localizify.setLocale('fa');

let mybot = new _bot(process.env.TelToken,//heroku config env
    '-1001532265592', //admin id for result
    localizify
);
// let mybot = new _bot(,//heroku config env
//     '-1001532265592', //admin id for result
//     localizify
// );
mybot.Run();