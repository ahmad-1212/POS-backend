import { Types } from 'mongoose';
import env from '../config/env';
import { UserRegisterDto } from '../dtos/user.dto';
import { IUser, IUserInfo } from '../interfaces/user.interface';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import { UserLoginDto } from '../dtos/user.dto';

import createHttpError from 'http-errors';

class UserService {
  /**
   * Creates a JWT token for the given user ID.
   *
   * @param {Types.ObjectId} id - The ID of the user.
   * @returns {string} The generated JWT token.
   */
  private createToken(id: Types.ObjectId): string {
    const token = jwt.sign({ id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return token;
  }

  /**
   * Registers a new user by creating a user document in the database.
   *
   * @param {UserRegisterDto} userData - The data to register the new user, including username, email, password, etc.
   * @returns {Promise<Omit<IUser, "password">>} -A promise that resolves to a user object with all fields except the password.
   *
   * @throws {Error} If there is an issue creating the user, such as a database error.
   */
  public async register(
    userData: UserRegisterDto
  ): Promise<Omit<IUser, 'password'>> {
    const newUser = await User.create(userData);
    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
  }

  /**
   * Authenticates a user by verifying the provided email and password.
   * If the credentials are correct, it generates a JWT token and returns user information.
   *
   * @param {UserLoginDto} userData - The login credentials including email and password.
   * @returns {Promise<Omit<IUserInfo, "password">>} A promise that resolves to an object containing user information with the password field omitted.
   *
   * @throws {HttpError} If the provided credentials are incorrect or missing, or if there is an issue finding the user.
   */
  public async login(
    userData: UserLoginDto
  ): Promise<Omit<IUserInfo, 'password'>> {
    const { email, password } = userData;

    // If no email and password
    if (!email && !password) {
      throw createHttpError(
        401,
        'Please provide your Email and Password to login!'
      );
    }

    // If no email or password
    if (!email || !password) {
      if (!email) {
        throw createHttpError(401, 'Please provide your Email to login!');
      }
      if (!password) {
        throw createHttpError(401, 'Please provide your password to login!');
      }
    }

    // Find user with email
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw createHttpError(401, 'Invalid email or password!');
    }

    // Create token and save in db
    const token = this.createToken(user._id);
    user.token = token;
    await user.save({ validateBeforeSave: false });
    // remove password from user
    const { password: pass, ...userWithoutPassword } = user.toObject();
    // return user without db
    return userWithoutPassword;
  }

  public async getAllUsers(): Promise<IUser[]> {
    // remove password and token
    const users = await User.find().select(['-password', '-token']);
    return users;
  }

  public async logout(id: Types.ObjectId): Promise<void> {
    await User.findByIdAndUpdate(id, { token: null });
  }

  public async deleteUser(
    id: Types.ObjectId,
    currentUserId: Types.ObjectId
  ): Promise<void> {
    type Role = 'staff' | 'cashier' | 'manager' | 'admin';

    const user = await User.findById(id);
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    if ((user.role as Role) === 'admin') {
      throw createHttpError(403, 'You cannot delete an admin!');
    }

    if (user._id.toString() === currentUserId.toString()) {
      throw createHttpError(403, 'You are not allowed to delete yourself!');
    }
    await User.findByIdAndDelete(id);
  }

  public async updateUser(
    id: Types.ObjectId,
    data: Partial<IUser>
  ): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    user.username = data.username || user.username;
    user.email = data.email || user.email;
    user.role = data.role || user.role;

    await user.save({ validateBeforeSave: false });

    return user;
  }
}

export default new UserService();
