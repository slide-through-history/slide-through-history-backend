const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
