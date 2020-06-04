const BadRequestError = require('../model/error/bad-request')
const UnauthorizedError = require('../model/error/unauthorized')

let _configuredSecretKey = process.env.SECRET_KEY || 'big-secret';

const extractSecretKey = request => {
  if (!request) {
    throw new BadRequestError('Missing query')
  }

console.log(request.query);
  if (!request.query || !request.query.secretKey) {
    throw new UnauthorizedError('Missing secret key in query')
  }

  return request.query.secretKey
};

const authMiddleware = (req, _, next) => {
  const secretKey = extractSecretKey(req)  
  
  if (_configuredSecretKey !== secretKey) {
    throw new UnauthorizedError('Provided secret key does not match')
  }

  next()
};

module.exports = authMiddleware