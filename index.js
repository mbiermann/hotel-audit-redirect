const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const validUrl = require('valid-url')
const app = express();
const authMiddleware = require('./utils/auth-middleware')
const BadRequestError = require('./model/error/bad-request')
const models = require('./model/url')

require('custom-env').env()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

app.get('/favicon.ico', (req, res) => res.status(200))

app.get('/:url', async (req,res) => {
    // decode and redirect url
    try {
        let url = await models.findURL(req.params.url);
        if(url !== null) {
            res.redirect(url);
        } else {
            res.send('invalid/expired URL');            
        }
    }
    catch(e) {
        console.log(e);
        res.send('invalid/expired URL');
    }
});

app.use(authMiddleware)

app.post('/api/short', async (req,res) => {
    if(validUrl.isUri(req.body.url)) {
        // valid URL        
        try {
            let hash = await models.storeURL(req.body.url);
            res.send(req.hostname + '/' +hash);
        }
        catch(e) {
            console.log(e);
            res.send('error occurred while storing URL.');
        }
    } else {
        res.send('invalid URL');
    }
});



const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Hotel Audit Redirect Webserive listening on port', port) );