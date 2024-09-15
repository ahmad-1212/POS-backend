import { RequestHandler } from "express-serve-static-core";
import { UserRegisterDto } from "../dtos/user.dto";
import userService from "../services/userService";
import { UserLoginDto } from "../dtos/user.dto";
import catchAsync from "../util/catchAsync";
import { Types } from "mongoose";

/**
 * Function to register user
 */
export const register: RequestHandler<{}, {}, UserRegisterDto> = catchAsync(
  async (req, res, next) => {
    const newUser = await userService.register(req.body);

    res.status(201).json({
      message: "User successfully created!",
      user: newUser,
    });
  }
);

/**
 * Function to login user
 */
export const login: RequestHandler<{}, {}, UserLoginDto> = catchAsync(
  async (req, res, next) => {
    const user = await userService.login(req.body);
    const { token, ...withoutTokenUser } = user;

    res.status(200).json({
      status: "successfull",
      token,
      user: withoutTokenUser,
    });
  }
);

/**
 * Function to retreive user
 */
export const getUser: RequestHandler = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: res.locals.user,
    },
  });
});

/**
 * Function to retreive all user
 */
export const getAllUsers: RequestHandler = catchAsync(
  async (req, res, next) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
      status: "success",
      length: users.length,
      data: {
        users,
      },
    });
  }
);

/**
 * Function to logout user
 */
export const logout = catchAsync(async (req, res, next) => {
  await userService.logout(res.locals.user._id);

  res.status(200).json({
    status: "success",
    message: "Logout successfully!",
  });
});

/**
 * Function to delete a user
 */

export const deleteUser: RequestHandler<{ id: string }> = catchAsync(
  async (req, res, next) => {
    await userService.deleteUser(new Types.ObjectId(req.params.id));
    res.status(200).json({
      status: "success",
      message: "User successfully deleted!",
    });
  }
);
