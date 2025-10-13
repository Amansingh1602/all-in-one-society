const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

export const validate = {
  required: (value) => !value?.trim() && 'This field is required',
  email: (value) => !validateEmail(value) && 'Please enter a valid email',
  minLength: (min) => (value) => 
    value?.length < min && `Must be at least ${min} characters`,
  date: (value) => {
    if (!value) return;
    const date = new Date(value);
    return isNaN(date.getTime()) && 'Please enter a valid date';
  },
  time: (value) => {
    if (!value) return;
    return !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) && 'Please enter a valid time (HH:MM)';
  }
};

export const validateForm = (values, rules) => {
  const errors = {};
  Object.keys(rules).forEach(field => {
    const value = values[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  return errors;
};
