exports.responseSuccessWithData = (data) => ({ data: data });
exports.responseSuccessWithMessage = (
  message = "Yeyy... Request Send With Successfully"
) => ({
  message: message,
});
exports.responseErrorWithMessage = (
  message = "Upsss... Something went wrong on server",
  error = null
) => {
  const response = {
    message: message,
  };
  if (error) {
    response.error = {
      name: error.name,
      code: error.code || error.status || undefined,
      details: error.message,
      stack: error.stack,
    };

    if (error.response && error.response.data) {
      response.error.response = error.response.data;
    }
  }
  return response;
};
