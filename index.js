const config = require('./config.js');

globalThis.print = console.log;
globalThis.debug = config.debug ? console.log : () => {};

const tasks_choices = [
  {
    message: 'build services',
    value: 'create_services',
  },
];

const { Select } = require('enquirer');

const prompt = new Select({
  name: 'command',
  message: 'Pick Develop Task',
  choices: tasks_choices,
});

function main() {
  prompt
    .run()
    .then((answer) => {
      console.log('Answer:', answer);
      const task_main_file = require(`./${[answer]}/index.js`);
      task_main_file(config);
    })
    .catch(console.error);
}

main();
