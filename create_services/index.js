const { promisify } = require('util');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const errorLogger = console.error;

function main(config) {
  const errorLoggerInDebug = config.debug ? console.error : () => {};

  const folders = fs.readdirSync(path.join(config.services_path));
  debug(folders);
  const services = {
    name: 'value',
    message: 'choose service',
    choices: folders,
    multiple: true,
  };
  const Enquirer = require('enquirer');
  const enquirer = new Enquirer();

  const selectServicesPrompt = new Enquirer.AutoComplete(services);
  const errors = [],
    success = [];
  selectServicesPrompt.run().then(async (services_names_to_build) => {
    debug(services_names_to_build);
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
    }

    const confimBuildPrompt = new Enquirer.Toggle({
      message: 'Ready to build docker for all those services ?',
      enabled: 'Yes',
      disabled: 'No',
    });

    confimBuildPrompt.run().then(async (answer) => {
      if (!answer) {
        print('see you some other time');
        return;
      }

      const isTagByBranch = {
        type: 'select',
        message:
          'Do you want to tag it with the branch (require config of the root) ?',
        choices: ['Yes', 'No'],
      };

      const is_branch_in_tag_name = await enquirer.prompt(isTagByBranch);
      let branch_name = '';
      if (is_branch_in_tag_name) {
        branch_name = await getBranchName(config.project_root, enquirer);
      }
      print(branch_name);
      print('those builds passed: ');
      print(success);

      //TODO: build the docker command
      // let the user option to edit the commant
      // exec the command

      // print('Answer:', package_json_file);
    });
  });
}

module.exports = main;

async function getBranchName(project_folder, enquirer) {
  let branch_name;
  const tagByBranchManually = {
    type: 'select',
    message: 'Do you want enter manually the branch ?',
    choices: ['Yes', 'No'],
  };

  const manualBranchInput = {
    type: 'input',
    message: 'Enter your branch name',
    initial: '',
    name: 'branch_name',
  };
  const current_branch_command = `git --git-dir=${project_folder}/.git branch --show-current`;
  try {
    branch_name = execSync(current_branch_command);
    console.log(`Branch: ${branch_name}`);
  } catch (err) {
    // node couldn't execute the command
    // errors.push({ __git_operation: err });
    // ask user if he wants to return or enter the branch manually
    print('There was an error retriving the branch name');
    const continue_enter_branch_manually = await enquirer.prompt(
      tagByBranchManually
    );
    if (!continue_enter_branch_manually) {
      return;
    }
    const response = await enquirer.prompt(manualBranchInput);
    branch_name = response.branch_name;
  }
  //  else {
  //   const continue_enter_branch_manually = enquirer.prompt(
  //     tagByBranchManually
  //   );
  //   if (!continue_enter_branch_manually) {
  //     return;
  //   }
  //   branch_name = await enquirer.prompt(manualBranchInput);
  // }

  return branch_name;
}
