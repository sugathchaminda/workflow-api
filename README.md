# qvalia-serverless-workflow-api

```
   ___             _ _        __        __         _     __ _                    _    ____ ___
  / _ \__   ____ _| (_) __ _  \ \      / /__  _ __| | __/ _| | _____      __    / \  |  _ \_ _|
 | | | \ \ / / _` | | |/ _` |  \ \ /\ / / _ \| '__| |/ / |_| |/ _ \ \ /\ / /   / _ \ | |_) | |
 | |_| |\ V / (_| | | | (_| |   \ V  V / (_) | |  |   <|  _| | (_) \ V  V /   / ___ \|  __/| |
  \__\_\ \_/ \__,_|_|_|\__,_|    \_/\_/ \___/|_|  |_|\_\_| |_|\___/ \_/\_/   /_/   \_\_|  |___|
```

Lambda Backend Project which provides set of API for workflow related functionalities to Duplo

## Build Status

[![Codeship Status for Qvalia/qvalia-serverless-workflow-api](https://app.codeship.com/projects/eb0b9dc0-b90e-0138-4c98-26c4ec2181bb/status?branch=master)](https://app.codeship.com/projects/404887)

## Offline Usage

- Run local QIP (http://localhost:1337)

- Clone the repository from:
  `https://github.com/Qvalia/qvalia-serverless-workflow-api.git`

- Set the project node version
  `nvm use`

- Install all dependencies:
  `npm install`

- Start the Offline Proxy API:
  `npm run offline`

API's will run on `http://localhost:3001/*`

## Testing with postman

- To test it out in Postman
- `GET http://localhost:3001/sample?email=sample@mail.com`
- `{"data": "API Worked in dev", "status": "success"}`

## Other NPM Scripts

- ##### Running tests
  _Note: Make sure you have the required environment variables in testEnv file_
  `npm test`

* ##### Test Coverage

  `npm run test:coverage`

* ##### Linting

  `npm run lint`

* ##### Fixing Linting Issues
  `npm run lint:fix`

## Configurations with `offline.yml`

- `offline.yml` file is used to give environment variables for the local development.
- Since `offline.yml` file may contain secure credentials, **we don't version it**.
  - We have a `offline.template.yml` file which you can use to create the `offline.yml` file.
    - **Make sure all the new environment variables you add to the project should also be added to the `offline.template.yml`.**
    - **If you are deploying it to the other environments, then you have to add the corresponding variables in the `AWS system manager > parameter store` as well.**

* Sample SSM configurations which will be in the offline.yml file

```
ssm:
  /dev/lambda/common/LAMBDA_STAGE: dev
  /dev/lambda/common/QVALIA_QIP_HOST: http://localhost:1337
  /dev/lambda/common/QVALIA_PROXY_HOST: http://localhost:3000
  /dev/lambda/QVALIA_SERVERLESS_WORKFLOW_API/SENTRY_DSN: <SENTRY_DSN_URL>
```

- After adding the env variable to `offline.yml` file, Include the configurations to serverless.yml file as well,

```
environment:
    LAMBDA_STAGE: ${ssm:/${opt:stage, self:provider.stage}/lambda/common/LAMBDA_STAGE}
```

- **Naming of variables**

  - If it is a common variable which can be used in multiple projects, then use `/dev/lambda/common/` prefix.
  - If it is only specific to this project, then use `/dev/lambda/QVALIA_SERVERLESS_WORKFLOW_API/` prefix.

- Then you can use the added variables in the code like `process.env.Var`.

## Data Modeling

- Add your DB connection options in the `offline.yml` file.
- Every model inherits the `./model.js` constructor function
- New models are created inside the `models` folder.
- Convention: Model file name should be the capitalised form of the corresponding table name.
  - ex: `user_workflow_role` table should be written like `UserWorkflowRole.js`
- Custom model files should be written in this format

```
const Model = require('../model');

const UserModel = new Model('user as user'); // table name - use the same alias instead of abbreviation like `u` to avoid confusion

// UserModel Specific Functions
UserModel.hi = () => {
  console.log('Hiiiiiii');
  return 'hello';
};

module.exports = UserModel;
```

- All the generic data model functions should be written inside the `./model.js` file.
- All the custom model specific function should be written in the corresponding model file `./models/CustomModel.js`
- Require the created custom model in the `./models/index.js` file and export it.

```
const User = require('./User');

module.exports = {
  User
};
```

- If you want to use the models, import it from `./models/index.js` file
  `const { User } = require('../../models/index');`

* Example Usage

  - queries :`User.getQueryBuilder().where(id, 1).select(['id', 'email'])`
  - When using the select use the referece alias

  ```
  const response = await this.getQueryBuilder()
    .where('workflow.active', true)
    .where('workflow.supplier', accountId);
  ```

## Creating Middlewares

- All the middlewares should be created inside the `middlware` folder as a separate file.

- import the middleware into `index` file.
  - This index file is the only file which will be used in other parts of the project.

* There are three types of middlwares in the project
  - Global Middlewares
  - Common Middlewares
  - Route specific middlewares

- ##### Global middlewares

  - Set of middlewares which should be fired for all the routes
  - Ex: cors, requestLogger

- ##### Common middlewares

  - set of middlewares which will be fired for multiple routes
  - Ex: checkWorkflowEnabled

- ##### Route specific middlewares
  - set of middlewares which are specific to a specific routes
  - Ex: userController: {fetchUsersRolesAndAliases: []}
  - Format: `controller: { function: [middlewares]}`

```
// file: /middleware/index.js
const cors = require('./cors');
const requestLogger = require('./requestLogger');
const requiredWorkflow = require('./checkWorkflowEnabled');

const globalMiddlewares = [cors, requestLogger];

module.exports = {
  globalMiddlewares,

  // common middlewares
  requiredWorkflow: [...globalMiddlewares, requiredWorkflow],

  // route specific middlewares
  userController: {
    fetchUsersRolesAndAliases: [...globalMiddlewares, requiredWorkflow]
  }
};
```

- Using the middlewares in routes

```
api.post('/url',...middlewares.requiredWorkflow, controller.function);
```

## Branching Stratergy

#### Special Branches

- `developement`: Main development branch
- `test`
- `qualityassurance`
- `production`

#### Feature Branches

##### Naming Conventions

- Feature: `f-add-`
- Bug: `f-bug-`

## Project Folder Structure

- `.github`

  - github related files
  - ex: `pull_request_template`, `issue_template files`

- `offline`

  - `hapi` server related files, which will run when running `npm run offline`

- `src`

  - source files
  - `handler.js`
    - main file which contain lambda function
  - `controller.js`
    - this file contain a generic controller utility function which is used by all the other controller files
  - `routes.js`
    - will contain all api endpoints and corresponding controller function
  - `api`
    - api related files
    - `<api>Controller.js` file
      - connector which connects endpoints with service files.
    - `<api>Service.js` file
      - server logic sits here.
    - `<api>Schema.js` file
      - have joi validation schema for the request
    - `<api>Validation`
      - have functions which validates the request with schema
  - `middlewares`
    - have middleware files such as `cors` for the `lambda-api`
  - `utils`
    - where all the common functions resides as wrapper functions
    - `apiHelper`
      - A wrapper for http client which is build using `got`
    - `cookieHelper`
      - Handling cookie related functions
    - `errorHelper`
      - Wrapper for error handling
    - `ApplicationError`
      - Custom error object created using standard error object
    - `responseHelper`
      - have `defaultResolve` and `defaultReject` functions for the request
      - unless there are specific requirements on how we should respond to a request, the controller file will use these default resolve and default reject
    - `schemaHelper`
      - have common validation functions build using joi
        - ex:
          - `requireAccountId`
          - `requireAccountAndSupplierAndRulesetId`
    - `validationHelper`
      - have reusable util functions related to validations
      - This util functions are used in `api > validation files`
      - functions
        - `clean`: remove undefined attributes in request
        - `validate`: validates api request with api specific schema file

- `test`

  - Unit tests for the src files
  - Will follow the same folder structure of `src` file
    - for `src/api/sample/sampleService.js` the test file will be `test/api/sample/sampleService.test.js`

- `Config files`
  - `.editorconfig`
    - editor configs will allow the text editor to follow the same conventions used in qvalia projects, such as the `indent-space`
  - `.eslintignore`
    - files belongs to the pattern specified in this file will not be considered in the linting process
  - `.eslintrc`
    - configurations for eslint, such as,
      - which style guide to use (airbnb in this project)
      - rules to check and fix when linting
  - `.gitignore`
    - specified files will be ignored from git versioning
  - `.lintstagedrc`
    - linting rules to fix
    - will execute before commiting (using pre commit hook)
  - `.nvmrc`
    - node version number
    - before starting the project run `nvm use`, so that the project node version will be set to the version specified in the `.nvmrc` file
  - `CHANGELOG.md`
    - file specific to github, which will be useful to see what got changed with different project releases
  - `offline.template.yml`
    - `ssm` variables for local debugging should be specified here
    - Add your aws keys to the `offline.yml` file as well
      - `/dev/lambda/QVALIA_SERVERLESS_WORKFLOW_API/AWS_ACCESS_KEY_ID:`
      - `/dev/lambda/QVALIA_SERVERLESS_WORKFLOW_API/AWS_SECRET_ACCESS_KEY:`
    - _for local testing, you need to create offline.yml file and copy the contents in template file with proper values._
  - `serverless.yml`
    - main serverless file which will have function information and other resource provitioning cloudformation.

## Test AWS services in local

  - Install Docker

  - Run the following command from console
    - docker run --rm -it -p 4566:4566 -p 4571:4571 -p 8085:8080 -v /private/tmp/localstack:/tmp/localstack -v /var/run/docker.sock:/var/run/docker.sock -e DEBUG=1 -e DATA_DIR=/tmp/localstack/data -e LAMBDA_EXECUTOR=docker -e DOCKER_HOST=unix:///var/run/docker.sock -e AWS_DEFAULT_REGION=eu-west-1 -e APP_ENV=local --name qvalia_localstack localstack/localstack
  
  - Deploy codes to the localstack
    - SLS_DEBUG=* sls deploy --stage local