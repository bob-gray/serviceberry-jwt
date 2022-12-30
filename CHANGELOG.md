0.3.0
-----
  - Updating [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken/wiki/Migration-Notes:-v8-to-v9) to version 9

0.2.1
-----
*No changes*

0.2.0
-----
  - Stopped setting `request.token` to `request.jwt.payload`
  - Deep-freezing `request.jwt` and setting its prototype to `null`
  - Added *accessToken* option
  - Throw error (calling `request.fail`) if decode is unsuccessful