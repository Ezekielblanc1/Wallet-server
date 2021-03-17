const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.comparePassword = async (password, userPassword) =>
  await bcrypt.compare(password, userPassword);

module.exports = mongoose.model("users", userSchema);
