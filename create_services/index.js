// todo a select for dev task
const fs = require('fs');
const path = require('path');

function main(config) {
  const folders = fs.readdirSync(path.join(config.services_path));
  debug(folders);
  const services = {
    name: 'value',
    message: 'choose service',
    choices: folders.map((folder_name) => ({
      name: folder_name,
      value: folder_name,
    })),
    // result(names) {
    //   return this.map(names);
    // },
  };
  const { MultiSelect, Toggle } = require('enquirer');
  const selectServicesPrompt = new MultiSelect(services);
  const errors = [],
    success = [];
  selectServicesPrompt
    .run()
    .then((services_names_to_build) => {
      // debug(service_name_and_path);
      const service_path_and_version = [];
      for (let folder_name of services_names_to_build) {
        const package_json_file = fs.readFileSync(
          path.join(config.services_path, folder_name, 'package.json'),
          'utf8'
        );
        if (package_json_file) {
          try {
            const { version } = JSON.parse(package_json_file);
            service_path_and_version.push({
              folder_name,
              version,
              serivce_path: path.join(config.services_path, folder_name),
            });
          } catch (err) {
            errors.push({ folder_name: err });
          }
        }

        const confimBuildPrompt = new Toggle({
          message: 'Do you want to docker build all those services ?',
          enabled: 'Yep',
          disabled: 'Nope',
        });
        confimBuildPrompt.run().then((answer) => {
          if (!answer) {
            print('see you some other time');
            return;
          }
          service_path_and_version.map((ser) => print(ser));
          //TODO: build the docker command
          // let the user option to edit the commant
          // exec the command

          // print('Answer:', package_json_file);
        });
      }
    })
    .catch(console.error);

  print('those builds faild: ');
  print(errors);
  print('those builds passed: ');
  print(success);
}

module.exports = main;
