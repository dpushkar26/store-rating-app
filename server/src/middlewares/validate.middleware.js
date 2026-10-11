const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    // Format Zod errors into a readable key-value object
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: formattedErrors 
    });
  }
};

module.exports = { validate };