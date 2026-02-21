export const formatValidationError = error => {
  if (!error) return 'Something went wrong';

  if (Array.isArray(error.issues)) {
    return error.issues.map(i => i.message).join(', ');
  }
  return JSON.stringify(error);
};
