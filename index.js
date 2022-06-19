globalThis.print = console.log;

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

prompt
  .run()
  .then((answer) => {
    console.log('Answer:', answer);
    const task_main_file = require(`./${[answer]}/index.js`);
    task_main_file();
  })
  .catch(console.error);
