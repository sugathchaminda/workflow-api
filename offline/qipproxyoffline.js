const Hapi = require('@hapi/hapi');
const functionHelper = require('serverless-offline/src/functionHelper');
const yaml = require('js-yaml');
const fs = require('fs');
const Path = require('path');

let runEnv = 'dev';
let offline = '';
let debug = '';

const createAWSContext = () => {
  return {
    awsRequestId: 'id',
    invokeid: 'id',
    logGroupName: '/aws/lambda/qvalia-serverless-workflow-api-dev-routes',
    logStreamName: 'qvalia-serverless-workflow-api-log-stream',
    functionVersion: 'HEAD',
    isDefaultFunctionVersion: true,
    functionName: 'qvalia-serverless-workflow-api-dev-routes',
    memoryLimitInMB: '1024',
    callbackWaitsForEmptyEventLoop: false,
  };
};

const createAWSEvent = (request) => {
  const method = request.method.toUpperCase();
  let cookie;
  if (request.state) {
    if (Array.isArray(request.state['sails.sid'])) {
      cookie = `sails.sid=${request.state['sails.sid'].slice(-1)[0]}`;
    } else {
      cookie = `sails.sid=${request.state['sails.sid']}`;
    }
  }
  return {
    httpMethod: method,
    path: request.path,
    queryStringParameters: request.query ? request.query : null,
    headers: {
      cookie,
      authorization: request.headers.authorization || '',
      origin: request.headers.origin || '',
      'x-forwarded-for': '127.0.0.1', // setting '127.0.0.1' to 'x-forwarded-for' when running workflow API offline
    },
    body: request.payload,
  };
};

const setupEnvironmentVariables = () => {
  try {
    const offlineFilePath = Path.join(__dirname, '../offline.yml');
    const configs = yaml.safeLoad(fs.readFileSync(offlineFilePath, 'utf8'));

    for (let key of Object.keys(configs.ssm)) {
      const envValue = configs.ssm[key] || '';

      const keyParts = key.split('/');
      const envKey = keyParts[keyParts.length - 1];

      process.env[envKey] = envValue;
    }
  } catch (e) {
    console.log(e);
  }
};

const runLambda = async (request) => {
  let path = process.cwd();
  if (path.slice(-8) === '/offline') path = path.slice(0, -8);

  const funOptions = {
    funName: 'routes',
    handlerName: 'run',
    handlerPath: path + '/src/handler',
    funTimeout: 30000,
    memorySize: undefined,
    runtime: 'nodejs12.x',
  };

  try {
    setupEnvironmentVariables();
    const handler = functionHelper.createHandler(funOptions, {});
    return handler(createAWSEvent(request), createAWSContext());
  } catch (e) {
    console.log(e);
  }
};

const resHandler = async (res, reply) => {
  if (res.headers['set-cookie']) {
    const c = String(res.headers['set-cookie'].replace('sails.sid=', ''));
    // console.log('FOUND COOKIE', c);
    reply.state('sails.sid', c);
  }
  if (res.headers) {
    Object.keys(res.headers).forEach(function (key) {
      const val = res.headers[key];
      if (key !== 'content-type') reply.header(key, val);
    });
  }
  return reply;
};

const log = (request) =>
  console.log('Calling:', request.method, request.path + request.url.search);

const init = async () => {
  const server = Hapi.server({
    port: 3001,
    host: 'localhost',
    routes: { cors: true },
    state: {
      strictHeader: false,
      ignoreErrors: true,
    },
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: async (request, reply) => {
      log(request);

      let result = await runLambda(request);
      const response = reply
        .response(result.body)
        .code(result.statusCode)
        .type(result.headers['content-type']);

      return resHandler(result, response);
    },
  });

  server.route({
    method: 'OPTIONS',
    path: '/{param*}',
    handler: async (request, reply) => {
      log(request);

      let result = await runLambda(request);
      const response = reply
        .response(result.body)
        .code(result.statusCode)
        .type(result.headers['content-type']);

      return resHandler(result, response);
    },
  });

  server.route({
    method: 'POST',
    path: '/{param*}',

    options: {
      payload: {
        multipart: {
          output: 'file',
        },
      },
      handler: async (request, reply) => {
        log(request);
        let result = await runLambda(request);

        const response = reply
          .response(result.body)
          .code(result.statusCode)
          .type(result.headers['content-type']);

        return resHandler(result, response);
      },
    },
  });

  server.route({
    method: 'PUT',
    path: '/{param*}',
    handler: async (request, reply) => {
      log(request);

      let result = await runLambda(request);
      const response = reply
        .response(result.body)
        .code(result.statusCode)
        .type(result.headers['content-type']);

      return resHandler(result, response);
    },
  });

  server.route({
    method: 'DELETE',
    path: '/{param*}',
    handler: async (request, reply) => {
      log(request);

      let result = await runLambda(request);
      const response = reply
        .response(result.body)
        .code(result.statusCode)
        .type(result.headers['content-type']);

      return resHandler(result, response);
    },
  });

  server.route({
    method: 'PATCH',
    path: '/{param*}',
    handler: async (request, reply) => {
      log(request);

      let result = await runLambda(request);
      const response = reply
        .response(result.body)
        .code(result.statusCode)
        .type(result.headers['content-type']);

      return resHandler(result, response);
    },
  });

  await server.start();
  console.clear();
  console.log(`
  _______  __   __  _______  ___      ___   _______    _     _  _______  ______    ___   _  _______  ___      _______  _     _    _______  _______  ___
 |       ||  | |  ||   _   ||   |    |   | |   _   |  | | _ | ||       ||    _ |  |   | | ||       ||   |    |       || | _ | |  |   _   ||       ||   |
 |   _   ||  |_|  ||  |_|  ||   |    |   | |  |_|  |  | || || ||   _   ||   | ||  |   |_| ||    ___||   |    |   _   || || || |  |  |_|  ||    _  ||   |
 |  | |  ||       ||       ||   |    |   | |       |  |       ||  | |  ||   |_||_ |      _||   |___ |   |    |  | |  ||       |  |       ||   |_| ||   |
 |  |_|  ||       ||       ||   |___ |   | |       |  |       ||  |_|  ||    __  ||     |_ |    ___||   |___ |  |_|  ||       |  |       ||    ___||   |
 |      |  |     | |   _   ||       ||   | |   _   |  |   _   ||       ||   |  | ||    _  ||   |    |       ||       ||   _   |  |   _   ||   |    |   |
 |____||_|  |___|  |__| |__||_______||___| |__| |__|  |__| |__||_______||___|  |_||___| |_||___|    |_______||_______||__| |__|  |__| |__||___|    |___|
    `);
  console.log('Usage arguments:');
  console.log(
    '   --env {dev|test|qa|prod}   ["dev" is default for local testing]'
  );
  console.log(
    '   --offline   [Use the local SSM variables in "offline.yml" ("dev" env needed to use local QIP!)]'
  );
  console.log(
    '   --debug   [debug flag to log out event and API routes on demand ]'
  );
  console.log('Using env:', runEnv);
  console.log('Using offline:', offline === ' --offline');
  console.log('Using debug:', debug === ' --debug');
  console.log('');
  console.log('Server running on %s', server.info.uri);
  console.log('Use CTRL+C / CMD+C to exit...');
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

for (let j = 0; j < process.argv.length; j++) {
  if (process.argv[j] === '--env') {
    runEnv = process.argv[j + 1];
    console.log('setting env to', runEnv);
  }
  if (process.argv[j] === '--offline') offline = ' --offline';
  if (process.argv[j] === '--debug') debug = ' --debug';
}

init();
