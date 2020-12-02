const tasks_choices = require('./tasks.js')
const {
    Select
} = require('enquirer');


const prompt = new Select({
    name: 'command',
    message: 'Pick Develop Task',
    choices: tasks_choices
});

prompt.run()
    .then(answer => {
        console.log('Answer:', answer)
        const task_main_file = require(`./${[answer]}`)

    })
    .catch(console.error)