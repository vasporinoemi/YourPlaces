class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // adds a 'message' porperty to this class
    this.code = errorCode; // adds a 'code' property to this class
  }
}

module.exports = HttpError;
