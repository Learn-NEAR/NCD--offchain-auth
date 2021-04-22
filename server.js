const fs = require('fs').promises;
const http = require('http');
const fetch = require('node-fetch');
const nacl = require('tweetnacl');
const near_api = require('near-api-js');

http.createServer(async function ({method, url, headers}, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");
  if (method == "OPTIONS") {
    res.end();
    return
  }

  if (url != "/api") {
    const data = await fs.readFile('./index.html')
    res.end(data);
    return
  }

  const authorization = headers['authorization'];
  if (!authorization) {
    res.write('no_authorization');
    res.end();
    return;
  }

  const { error } = await parse_authorization(authorization)

  res.write(error);
  res.end();
}).listen(8080);

//------------------------
//  FUNCTIONS
//------------------------
const NEAR_URL = "https://rpc.mainnet.near.org"

async function http_post_near(args) {
  const init = {
    method: "POST",
    body: JSON.stringify(args),
    headers: {
      "Content-Type": "application/json"
    }
  }
  const response = await fetch(NEAR_URL, init);
  if (response.status != 200) {
    throw {error: "near_api_error", status: response.status, response: await response.json()}
  }
  return await response.json();
}

async function parse_authorization(authorization) {
  const token_binary = near_api.utils.serialize.base_decode(authorization)
  var token_text = (new TextDecoder()).decode(token_binary)
  var lastIndex = token_text.lastIndexOf('.')

  var token = token_text.substr(0, lastIndex)
  var signature = token_text.substr(lastIndex+1)

  var {provider, account, public_key_b58, epoch} = JSON.parse(token)

  const public_key_binary = near_api.utils.serialize.base_decode(public_key_b58)
  const signature_binary = near_api.utils.serialize.base_decode(signature)
  const is_valid = nacl.sign.detached.verify((new TextEncoder()).encode(token), signature_binary, public_key_binary)
  if (!is_valid)
    return {error: "invalid_signature"}

  if (provider == "near") {
      const params = {request_type: "view_access_key", finality: "final", account_id: account, public_key: "ed25519:"+public_key_b58}
      var {result} = await http_post_near({jsonrpc: "2.0", id: "1", method: "query", params: params})
      const is_key_tied_to_account = !result.error;
      if (!is_key_tied_to_account)
        return {error: "account_not_tied_to_key"}
      return {error: "ok", account: account};
  } else if (provider == "eth") {
    return {error: "this_provider_is_not_supported"}
  } else {
    return {error: "this_provider_is_not_supported"}
  }
}
