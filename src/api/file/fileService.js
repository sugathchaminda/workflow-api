const AWS = require('aws-sdk');

function getSignedFileUrl(fileName, bucket, folder, expireTime) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.CW_ACCESS_KEY_ID,
    secretAccessKey: process.env.CW_SECRET_ACCESS_KEY,
    region: process.env.CW_REGION,
  });

  const params = {
    Bucket: bucket,
  };

  if (folder) {
    params.Key = `${folder}${fileName}`;
  } else {
    params.Key = fileName;
  }

  if (expireTime) {
    params.Expires = expireTime;
  }

  return s3.getSignedUrl('getObject', params);
}

module.exports = {
  getSignedFileUrl,
};
