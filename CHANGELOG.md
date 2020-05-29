0.2.1
-----
*No changes*

0.2.0
-----
  - Stopped setting `request.token` to `request.jwt.payload`
  - Deep freezing `request.jwt` and settting its prototype to `null`
  - Added *accessToken* option
  - Throw error (calling `request.fail`) if decode is unsuccessful