require("./src/cards.js");
require("./config.js");
const TelegramBot = require("node-telegram-bot-api");

// Heroku-specific stuff
const options = {
  webHook: {
    // Port to which you should bind is assigned to $PORT variable
    // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
    port: process.env.PORT
    // you do NOT need to set up certificates since Heroku provides
    // the SSL certs already (https://<app-name>.herokuapp.com)
    // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
  }
};
// Heroku routes from port :443 to $PORT
// Add URL of your app to env variable or enable Dyno Metadata
// to get this automatically
// See: https://devcenter.heroku.com/articles/dyno-metadata
const url = process.env.APP_URL || 'https://cigana-bot.herokuapp.com:443';
const bot = new TelegramBot(config.telegramToken, options);

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${url}/bot${config.telegramToken}`);

var cache = [];

// Matches "/start [whatever]"
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, daily(msg.from.id));
});

// Matches "/diario [whatever]"
bot.onText(/\/diario/, (msg) => {
  bot.sendMessage(msg.chat.id, daily(msg.from.id));
});

var daily = function(id) {
  return getReading(getCard(id));
};

var getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

var getReading = function(card) {
  return "Seu arcano hoje: " + card.name + "\n" + card.link;
};

var isFromToday = function(inputDate) {
  todaysDate = new Date();
  // Check if its today's date
  // FIX-ME: THIS HAS UNDESIRED SIDE-EFFECTS :(
  if(inputDate.setHours(0,0,0,0) === todaysDate.setHours(0,0,0,0)) {
    // Date equals today's date
    return true;
  } else {
    return false;
  }
};

var getCard = function(id) {
  // check if it has already been taken today
  if(cache[id] && isFromToday(cache[id].date)) {
    return(cards[cache[id].number]);
  } else {
    cardNumber = getRandomInt(cards.length);
    cache[id] = { number: cardNumber,
		  date: new Date()
		};
    return(cards[cardNumber]);
  }
};
