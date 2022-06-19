// todo a select for dev task
const config = require('../config.js');
const fs = require('fs');
const path = require('path');

function main() {
  const folders = fs.readdirSync(path.join(config.services_path));
  print(folders);
  const services = {
    message: 'choose service',
    name: 'services',
    choices: folders.map((folder_name) => ({
      name: folder_name,
      value: folder_name,
    })),
  };
  const { MultiSelect } = require('enquirer');
  const prompt = new MultiSelect(services);

  prompt
    .run()
    .then((answer) => {
      print('Answer:', answer);
    })
    .catch(console.error);
}

module.exports = main;
