const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const fetch = require("node-fetch")

const HASURA_OPERATION = `
query MyQuery($user_id: smallint!,$password : String) {
  vcards_ods_login_auth(where: {user_id: {_eq: $user_id}, password: {_eq: $password}}) {
    email
    password
    user_name
  }
}
`;

// execute the parent operation in Hasura
const execute = async (variables) => {
  const fetchResponse = await fetch(
    "http://34.207.85.175/v1/graphql",
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  const data = await fetchResponse.json();
  console.log('DEBUG: ', data);
  return data;
};
  

// Request Handler
app.post('/MyQuery', async (req, res) => {

  // get request input
  const { user_id, password } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ user_id, password });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0])
  }

  // success
  return res.json({
    ...data.vcards_ods_login_auth
  })

});

app.listen(PORT);
