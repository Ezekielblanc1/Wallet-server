const Profile = require("../models/Profile");
const User = require("../models/User");
exports.createProfile = async (req, res) => {
  const user = await User.findOne({ _id: req._id });
  const existingProfile = await Profile.findOne({ userId: req._id });
  if (existingProfile) {
    existingProfile.name = req.body.name || existingProfile.name;
    existingProfile.phone = req.body.phone || existingProfile.phone;
    existingProfile.Address = req.body.Address || existingProfile.Address;
    existingProfile.city = req.body.city || existingProfile.city;
    user.username = req.body.username || user.username;
    await existingProfile.save();
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully..",
    });
  }
  const profile = new Profile({
    ...req.body,
    userId: req._id,
  });
  await profile.save();
  return res.status(200).json({
    success: true,
    message: "Profile created successfully..",
  });
};

exports.getProfile = async (req, res, next) => {
  const profile = await Profile.findOne({ userId: req._id });
};
