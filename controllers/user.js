const joi = require("joi");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User");
const Accounts = require("../models/Accounts");

exports.createUser = async (req, res, next) => {
  const schema = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
  });
  const validation = schema.validate({
    username: req.body.username,
    password: req.body.password,
  });
  if (validation.error) {
    return {
      success: false,
      error: validation.error.details[0].message,
    };
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Account already exists",
      });
    }
    const user = await User.create({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, bcrypt.genSaltSync(12)),
    });
    await Accounts.create({
      userId: user._id,
      balance: 5000000,
    });

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      message: "User account created",
      success: true,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
