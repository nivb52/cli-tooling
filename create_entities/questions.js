// todo a select for dev task

const questions = [
    {
        type: 'input',
        name: 'model',
        message: 'Enter Model name (without "Model" e.g: customer has customer)'
    },
    {
        type: 'input',
        name: 'table',
        message: 'Enter Table Name (e.g customers has customer)'
    },
    {
        type: 'confirm',
        name: 'porxy',
        message: 'to add proxy?'
    },
    {
        type: 'confirm',
        name: 'emmiter',
        message: 'to add emitter?'
    }
];
module.exports = questions;
