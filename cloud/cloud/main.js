// The example below shows you how a cloud code function looks like.

Parse.Cloud.define("hello", (request) => {
  return "Hello world!";
});

/* Parse Server 2.x
 * Parse.Cloud.define("hello", function(request, response){
 * 	response.success("Hello world!");
 * });
 */

// To see it working, you only need to call it through SDK or REST API.
// Here is how you have to call it via REST API:

/** curl -X POST \
 * -H "X-Parse-Application-Id: BxzWRTKVpASfYYmKvi9vWsM8KpDAZCqPkTd2E7DY" \
 * -H "X-Parse-REST-API-Key: mdq7zPwZyHOgGwCMpdDb5Its90FdhEK8r7KlGpSA" \
 * -H "Content-Type: application/json" \
 * -d "{}" \
 * https://parseapi.back4app.com/functions/hello
 */

// If you have set a function in another cloud code file, called "test.js" (for example)
// you need to refer it in your main.js, as you can see below:

/* require("./test.js"); */
