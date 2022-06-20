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
  const { AutoComplete, Toggle, Input } = require('enquirer');
  const selectServicesPrompt = new AutoComplete(services);
  const errors = [],
    success = [];
  selectServicesPrompt.run().then((services_names_to_build) => {
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

    const confimBuildPrompt = new Toggle({
      message: 'Do you want to docker build all those services ?',
      enabled: 'Yes',
      disabled: 'No',
    });
    confimBuildPrompt
      .run()
      .then((answer) => {
        if (!answer) {
          print('see you some other time');
          return;
        }

        const isTagByBranchPrompt = new Toggle({
          message:
            'Do you want to tag it with the branch (require config of the root) ?',
          enabled: 'Yes',
          disabled: 'No',
        });

        const tagByBranchManuallyPrompt = new Toggle({
          message: 'Do you want enter manually the branch ?',
          enabled: 'Yes',
          disabled: 'No',
        });

        const manualBranchInputPrompt = new Input({
          message: 'What is your branch?',
          initial: '',
        });

        let tag_by_branch;
        isTagByBranchPrompt
          .run()
          .then((yes) => {
            if (yes) {
              const current_branch_command = `git --git-dir=${config.project_root}/.git branch --show-current`;
              try {
                tag_by_branch = execSync(current_branch_command);
                console.log(`Branch: ${tag_by_branch}`);
              } catch (err) {
                // node couldn't execute the command
                errors.push({ __git_operation: err });
                // ask user if he wants to return or enter the branch manually
                print('There was an error retriving the branch name');
                tagByBranchManuallyPrompt
                  .run()
                  .then((continue_enter_branch_manually) => {
                    if (!continue_enter_branch_manually) {
                      return;
                    }

                    manualBranchInputPrompt
                      .run()
                      .then((answer) => (tag_by_branch = answer))
                      .catch(errorLoggerInDebug);
                  });
              }
            } else {
              tagByBranchManuallyPrompt
                .run()
                .then((continue_enter_branch_manually) => {
                  if (!continue_enter_branch_manually) {
                    return;
                  }

                  manualBranchInputPrompt
                    .run()
                    .then((answer) => (tag_by_branch = answer))
                    .catch(errorLoggerInDebug);
                });
            }
          })
          .then((a) => {
            print('those builds passed: ');
            print(success);
          })
          .catch(errorLoggerInDebug);

        //TODO: build the docker command
        // let the user option to edit the commant
        // exec the command

        // print('Answer:', package_json_file);
      })
      .catch(errorLogger);
  });
}

module.exports = main;
