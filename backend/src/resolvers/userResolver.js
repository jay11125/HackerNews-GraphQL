const UserModel = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (_, args) => {
  const { email, name, password } = args;

  let alreadyExists = await UserModel.findOne({ email });
  if (alreadyExists) {
    throw new Error("User already exists with this email");
  }
  const salt = bcryptjs.genSaltSync(10);
  let hashedPassword = bcryptjs.hashSync(password, salt);

  let newUser = new UserModel({
    email,
    name,
    password: hashedPassword,
    links: [],
  });

  let user = await newUser.save();
  let token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);
  user.token = token;
  return { user, token };
};

const login = async (_, args) => {
  const { email, password } = args;

  let user = await UserModel.findOne({ email }).populate("links");
  if (user) {
    const checkPassword = bcryptjs.compareSync(password, user.password);
    if (checkPassword) {
      let token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);

      return { user, token };
    } else {
      throw new Error("Invalid Email or Password");
    }
  } else {
    throw new Error("No user found with that email");
  }
};

module.exports = { signup, login };
