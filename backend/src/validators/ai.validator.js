const { z } = require('zod');

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty').max(2000),
  }),
});

module.exports = {
  chatSchema,
};
