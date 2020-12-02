const questions = require('./questions.js')

async function getUserAnswers() {
    const {
        prompt
    } = require('enquirer');
    let answers = await prompt(questions);
    console.log(answers);
    return answers;
}


module.exports = getUserAnswers()
