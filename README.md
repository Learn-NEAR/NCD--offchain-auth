# Offchain Auth for NEAR

![ezgif-4-ae566e9edb42](https://user-images.githubusercontent.com/3028982/115793838-d8a64b00-a39a-11eb-879c-81c9ed57e7f9.gif)

## Basic description (NEAR Mainnet)

 - We signin to a contract and get our access key
 - We sign a JWT style token with our access key
 - We pass along this signed token as Authentication to something offchain
 - Offchain we query via NEAR RPC if this access key is valid
 
## Cool (not implemented) bonus features
 
 - [ ] Conforming to a spec like subset of JWT
 - [ ] Allowing another account to sign the token with offchain roles/permissions
 - [ ] Carrying a Curve25519 pubkey as well derived from the accesskey to allow offchain encryption
 - [ ] Caching the response from NEAR RPC
 - [ ] Revoking tokens via epoch/other
 
## How to run

```
npm install -g node-fetch tweetnacl near-api-js
node server.js

Navigate to http://localhost:8080
click M button
You will be asked to add access_key to contract (default is sputnikdao.near)
Try an offchain request
```

