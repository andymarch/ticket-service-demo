require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const OktaJwtVerifier = require("@okta/jwt-verifier")

app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.ISSUER,
});

function verifyUserAccess(req,res,next){
  var authz = req.header("Authorization")
  if(authz != null && authz.startsWith("Bearer")){
    oktaJwtVerifier.verifyAccessToken(authz.replace("Bearer ",""),process.env.TOKEN_AUD)
    .then(jwt => {
        req.sub = jwt.claims.sub
        req.customer_number = jwt.claims.customer_number
        if(jwt.claims.onBehalf == "True"){
          req.on_behalf = true
          req.on_behalf_sub = jwt.claims.on_behalf_sub
        }
        return next();
    })
    .catch(err => {
      console.log(err)
      res.status(401).send({message: 'Access denied.'})
    });   
  }
  else{
    console.log("Unauthenticated request")
      res.status(401).send({message: 'Access denied.'})
  }
}
var ticketRouter = require('./routes/tickets')()
app.use('/tickets', verifyUserAccess, ticketRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ticket Demo Service started on '+PORT))