const shortId = require('shortid')
const redis = require('redis')

const client = redis.createClient(6379, process.env.REDIS_HOST)

client.on('connect', () => {
    console.log('Connected to redis server');
});

client.on('ready', () => {
    console.log('ready to work with redis server');
});

client.on('error', (err) => {
    console.log('Error occurred while connecting to redis');
});

function storeURL(url) {
    return new Promise((resolve, reject) => {
        client.get(url, (err, reply) => {
            if(err) {
                return reject('error occurred during the redis operation');
            }
            if(reply) {
                resolve(reply);
            } else {
                // make new entry
                let id = shortId.generate();
                client.set(id, url, 'EX', process.env.REDIS_TTL);
                // set URL as a key too for searching
                client.set(url, id, 'EX', process.env.REDIS_TTL);
                // return
                resolve(id);
            }
        });
    });
}

function findURL(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, reply) => {
            if(err) {
                return reject('error occurred during the redis operation');                
            }
            // check if the reply exists
            if(reply === null) {
                resolve(null);
            } else {
                resolve(reply);
            }
        });
    });
}

module.exports = {
    storeURL: storeURL,
    findURL: findURL
};