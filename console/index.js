'use strict';

const smoochBot = require('smooch-bot');
const MemoryStore = smoochBot.MemoryStore;
const MemoryLock = smoochBot.MemoryLock;
const Bot = smoochBot.Bot;
const Script = smoochBot.Script;
const StateMachine = smoochBot.StateMachine;

class ConsoleBot extends Bot {
    constructor(options) {
        super(options);
    }

    say(text) {
        return new Promise((resolve) => {
            console.log(text);
            resolve();
        });
    }
}
var demotivations = ["Oh, that's a conversation killer.", "Seriously? I think my blind cat has got more vision than that.", "well, your mother must be so proud of you. Not."];

const script = new Script({
    start: {
        receive: (bot) => {
            return bot.say('Hi! I\'m Smooch Bot!')
                .then(() => 'askName');
        }
    },

    askName: {
        prompt: (bot) => bot.say('What\'s your name'),
        receive: (bot, message) => {
            const name = message.text.trim();
            bot.setProp('name', name);
            return bot.say(`I'll call you ${name}! Great!`)
                .then(() => 'askAge');
        }
    },

    askAge: {
      prompt: (bot) => { bot.getProp('name').then((name) =>
          bot.say(`${name}, how old are you?`));
      },
      receive: (bot, message) => {
        const age = message.text.trim();
        bot.setProp('age', age);
        return bot.say("You're ancient!")
          .then(() => 'askHopes');
      }
    },

    askHopes: {

      prompt: (bot) => { bot.getProp('name').then((name) =>
          bot.say(`${name}, what are your hopes and dreams?`));
      },
      receive: (bot, message) => {
        return bot.say(demotivations[Math.floor(Math.random() * demotivations.length)] + "\nLet's try again.")
          .then(() => 'askHopes');
      }
    },

    finish: {
        receive: (bot, message) => {
            return bot.getProp('name')
                .then((name) => bot.say(`Sorry ${name}, my creator didn't ` +
                        'teach me how to do anything else!'))
                .then(() => 'finish');
        }
    }
});

const userId = 'testUserId';
const store = new MemoryStore();
const lock = new MemoryLock();
const bot = new ConsoleBot({
    store,
    lock,
    userId
});

const stateMachine = new StateMachine({
    script,
    bot,
    userId
});

process.stdin.on('data', function(data) {
    stateMachine.receiveMessage({
        text: data.toString().trim()
    })
        .catch((err) => {
            console.error(err);
            console.error(err.stack);
        });
});
