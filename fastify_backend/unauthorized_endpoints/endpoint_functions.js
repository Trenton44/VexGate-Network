const D2APIWrapper = require('./bungie_api/d2_api_wrapper.js');
/*
    The flow of each of these functions should be as follows:
    -obtain user parameters from querystring, and token data from session
    -make bungie api request.
    -filter the results to only data the frontend needs. output schema needs to match this.
    -return filtered data to frontend

    Errors should be handled by generating an appropriate error object and returning it to the frontend.
    frontend is responsible for recovering.
*/