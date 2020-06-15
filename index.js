const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const validUrl = require('valid-url')
const app = express();
const authMiddleware = require('./utils/auth-middleware')
const BadRequestError = require('./model/error/bad-request')
const models = require('./model/url')
const { measure } = require('measurement-protocol')
const TRACK_EVENT_CATEGORY = 'End User Information Page'

require('custom-env').env()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

const trackEvent = (action, label) => {
    measure(process.env.GA_TRACKING_ID).event(TRACK_EVENT_CATEGORY, action, label).send()
}

app.get('/favicon.ico', (req, res) => res.status(200))

app.get('/:url', async (req,res) => {
    const referrer = req.get('Referrer')
    // decode and redirect url
    try {
        let url = await models.findURL(req.params.url);
        if(url !== null) {
            trackEvent('Redirect Open Success', referrer+"::"+url)
            res.redirect(url);
        } else {
            trackEvent('Redirect Open Failure Expired URL', referrer+"::"+req.params.url)
            res.send('invalid/expired URL');
        }
    }
    catch(e) {
        trackEvent('Redirect Open Error', referrer+"::"+req.params.url+"::"+e.message)
        res.send('invalid/expired URL');
    }
});

app.use(authMiddleware)

app.post('/api/short', async (req,res) => {
    if(validUrl.isUri(req.body.url)) {
        // valid URL        
        try {
            let hash = await models.storeURL(req.body.url);
            trackEvent('Redirect Create Success', req.body.url+"::"+hash)
            res.send(req.hostname + '/' +hash);
        }
        catch(e) {
            trackEvent('Redirect Create Error', req.body.url+"::"+e.message)
            res.send('error occurred while storing URL.');
        }
    } else {
        trackEvent('Redirect Create Failure Invalid URL', req.body.url)
        res.send('invalid URL');
    }
});



const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Hotel Audit Redirect Webserive listening on port', port) );