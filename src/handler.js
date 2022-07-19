/* eslint-disable no-undef */
/* eslint-disable max-len */

const awsXRay = require('aws-xray-sdk');
awsXRay.captureAWS(require('aws-sdk'));

const api = require('lambda-api')({ version: 'v1.0', base: '/' });
const cors = require('./middleware/cors');

const routes = require('./routes');

const ApplicationError = require('./utils/ApplicationError');
const ErrorHelper = require('./utils/errorHelper');
const { API, INTERNAL_BASE_API } = require('./utils/apiHelper');
const { isCookieLessPath } = require('./utils/authHelper');

api.use(cors);

routes.load(api);

// handling unmatched routes
api.any('*', async (req, res) => {
  res.status(404).send(
    ErrorHelper({
      message: `Cannot find ${req.method} endpoint for ${req.path}`,
      statusCode: 404,
    }).payload
  );
});

const generatePolicy = (principalId, effect, user) => ({
  isAuthorized: effect === 'Allow',
  context: {
    principalId,
    user,
  },
});

module.exports.run = async (event, context) => {
  try {
    return api.run(event, context);
  } catch (err) {
    throw new ApplicationError({
      message: 'Error in starting the server',
      statusCode: 500,
    });
  }
};

module.exports.auth = async (event) => {
  if (event.headers && !(event.headers.cookie || event.headers.Cookie)) {
    // receive invoice which doesn't have a user cookie
    const urlPath = process.env.LAMBDA_STAGE === 'dev' ? event.path : event.rawPath;
    if (urlPath && isCookieLessPath(urlPath)) {
      if (
        event.headers
        && (event.headers.Authorization === process.env.AUTH_KEY
          || event.headers.authorization === process.env.AUTH_KEY)
      ) {
        if (process.env.LAMBDA_STAGE === 'dev') {
          return {
            principalId: 'system',
            policyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Action: 'execute-api:Invoke',
                  Effect: 'Allow',
                  Resource: `arn:aws:execute-api:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${process.env.API_ID}/${process.env.LAMBDA_STAGE}/*/*`,
                },
              ],
            },
          };
        }

        return generatePolicy('system', 'Allow', {});
      }
    }
  }

  // request qip api /users/me
  const client = new API({
    method: 'GET',
    uri: `${INTERNAL_BASE_API}/users/me`,
    headers: {
      cookie: event.headers.cookie || event.headers.Cookie,
    },
  });

  let response = null;
  try {
    response = await client.send();
  } catch (err) {
    throw Error('Unauthorized');
  }

  const jsonResponse = response && JSON.parse(response.body);
  const Effect = jsonResponse && jsonResponse.id ? 'Allow' : 'Deny';
  const principalId = jsonResponse ? jsonResponse.id : 'error';

  const context = Effect === 'Deny'
    ? { customErrorMessage: 'Authentication failed.' }
    : { user: response.body };

  if (process.env.LAMBDA_STAGE === 'dev') {
    return {
      principalId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect,
            Resource: `arn:aws:execute-api:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${process.env.API_ID}/${process.env.LAMBDA_STAGE}/*/*`,
          },
        ],
      },
      context,
    };
  }

  return generatePolicy(principalId, Effect, response.body);
};
