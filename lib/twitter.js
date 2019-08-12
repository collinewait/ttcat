const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const axios = require('axios');

class Twitter {
  constructor(consumerKey, consumerSecret) {
    this.baseUrl = 'https://api.twitter.com/';
    this.token = {};
    const oauth = OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, key) {
        return crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      },
    });
    axios.interceptors.request.use(config => {
      const configuration = config;
      // configuration.baseURL = this.baseUrl;
      configuration.headers = oauth.toHeader(
        oauth.authorize(
          {
            url: `${config.baseURL}${config.url}`,
            method: config.method,
            data: config.data,
          },
          this.token,
        ),
      );
      configuration.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return config;
    });
    axios.defaults.baseURL = this.baseUrl;
  }

  setToken(key, secret) {
    this.token = { key, secret };
  }

  async get(api) {
    const response = await axios.get(api);
    return response.data;
  }

  async post(api, data) {
    try {
      const response = await axios.post(api, data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Twitter;
