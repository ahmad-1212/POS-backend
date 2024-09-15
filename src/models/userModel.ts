import { Model, model, Schema } from "mongoose";
import { IUser, IUserMethods } from "../interfaces/user.interface";
import bcrypt from "bcrypt";

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Username is required!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
    },
    role: {
      type: String,
      default: "cashier",
      enum: {
        values: ["staff", "cashier", "manager", "admin"],
        message: "Invalid value please choose either cashier, manager or staff",
      },
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters!"],
      required: [true, "Password is required!"],
    },
    confirmPassword: {
      type: String,
      validate: {
        validator: function (val: string) {
          return val === (this as IUser).password;
        },
        message: "Password should be matched!",
      },
      required: [true, "Confirm password is required!"],
    },
    token: String,
  },
  {
    timestamps: true,
  }
);

/**
 * Encrypt password before saving the password in the database.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Encrypt the password
  this.password = await bcrypt.hash(this.password, 12);

  // Remove the confirm password field
  this.confirmPassword = undefined;

  next();
});

/**
 * Method to check if the entered password is correct.
 */
userSchema.methods.correctPassword = async function (
  enteredPassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, userPassword);
};

const User = model<IUser, UserModel>("User", userSchema);

export default User;
