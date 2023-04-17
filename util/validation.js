function isValidText(value, minLength = 2, maxLength = 30) {
  return (
    value &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength &&
    /^[a-zA-Z\s]+$/.test(value)
  );
}

function isValidDate(value) {
  const date = new Date(value);
  return value && date !== "Invalid Date";
}

function isValidUsername(value, minLength = 6, maxLength = 30) {
  return (
    value &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /^[A-Za-z0-9]*$/.test(value) &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength
  );
}

function isValidPassword(value, minLength = 8, maxLength = 16) {
  return (
    value &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[$&+,:;=?@#|'"<>.⌃*()%!-_]/.test(value)
  );
}

exports.isValidText = isValidText;
exports.isValidDate = isValidDate;
exports.isValidUsername = isValidUsername;
exports.isValidPassword = isValidPassword;
