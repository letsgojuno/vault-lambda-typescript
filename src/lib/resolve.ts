import AWS from 'aws-sdk';
import aws4 from 'aws4';
import fromEntries from 'object.fromentries';
import { parallel, AsyncResultObjectCallback } from 'async';
import { SecretDefinition } from './extractor';

const sts = new AWS.STS();

const base64Encode = (input: string) => new Buffer(input).toString('base64');

export async function resolve(secrets: [SecretDefinition]) {
  console.log('---------------');
  const resp = await parallel(
    fromEntries([
      [
        'one',
        (callback: AsyncResultObjectCallback<any, any>) =>
          callback(null, { foo: 123 })
      ]
    ])
  );
  // const resp = await parallel({
  //   one: callback => callback(null, 123)
  // });
  console.log(resp);
  return resp;

  // const token = process.env.VAULT_TOKEN || (await authenticateWithVault());

  // const entries = secrets.map(({ envVar, path, key }) => {
  //   return [envVar, fetchSecret(path, key, token)];
  // });

  // const resolvedSecrets = await parallel(fromEntries(entries));
  // const errors = resolvedSecrets.filter(
  //   ([envVar, result]) => result === undefined
  // );
  // if (errors.length > 0)
  //   throw new Error(
  //     `Error resolving ${JSON.stringify(errors.flatMap(([envVar]) => envVar))}`
  //   );
}

async function fetchSecret(path: string, key: string, token: string) {
  if (process.env.VAULT_ADDR === undefined)
    throw new Error('VAULT_ADDR is not set');

  const resp = await fetch(`${process.env.VAULT_ADDR}/v1/${path}`, {
    headers: { 'X-Vault-Token': token }
  });
  const { data } = await resp.json();
  return data[key];
}

export async function authenticateWithVault(): Promise<string> {
  if (process.env.VAULT_ADDR === undefined)
    throw new Error('VAULT_ADDR is not set');
  if (process.env.VAULT_HEADER_VALUE === undefined)
    throw new Error('VAULT_HEADER_VALUE is not set');

  const opts = aws4.sign({
    service: 'sts',
    path: '/?Action=GetCallerIdentity',
    headers: {
      'X-Vault-AWS-IAM-Server-ID': process.env.VAULT_HEADER_VALUE
    }
  });

  const { Arn } = await sts.getCallerIdentity().promise();
  if (Arn === undefined) throw new Error('role unknown');
  const roles = Arn.split('/', 2)[1];

  const vaultRequest = {
    iam_http_request_method: 'POST',
    iam_request_url: base64Encode('url'),
    iam_request_body: '',
    iam_request_headers: '',
    role: 'a role'
  };

  const resp = await fetch(`${process.env.VAULT_ADDR}/v1/auth/aws/login`, {
    method: 'POST'
  });

  return (await resp.json())['auth']['client_token'];
}
