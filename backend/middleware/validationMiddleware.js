export function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const val = req.body[field];

      if (rules.required && (val === undefined || val === null || val === '')) {
        errors.push(`Field '${field}' is required.`);
        continue;
      }

      if (val !== undefined && val !== null) {
        if (rules.type === 'string' && typeof val !== 'string') {
          errors.push(`Field '${field}' must be a string.`);
        } else if (rules.type === 'number' && (typeof val !== 'number' || isNaN(val))) {
          errors.push(`Field '${field}' must be a valid number.`);
        } else if (rules.type === 'email' && (typeof val !== 'string' || !val.includes('@') || !val.includes('.'))) {
          errors.push(`Field '${field}' must be a valid email address.`);
        } else if (rules.min !== undefined && val < rules.min) {
          errors.push(`Field '${field}' must be at least ${rules.min}.`);
        } else if (rules.max !== undefined && val > rules.max) {
          errors.push(`Field '${field}' must not exceed ${rules.max}.`);
        } else if (rules.minLength !== undefined && val.length < rules.minLength) {
          errors.push(`Field '${field}' must be at least ${rules.minLength} characters.`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  };
}
