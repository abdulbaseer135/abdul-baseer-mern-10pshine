class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  // Sonar: class justified by serialization helper used by res.json()
  toJSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
      success: this.success,
    };
  }
}

module.exports = ApiResponse;