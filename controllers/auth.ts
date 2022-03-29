import { sign } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { SingleuserType } from '../types/userType';
import User from '../db/models/User';
import { addToDB, findFromDB, UpdateToDB } from '../utils/shared';
import { authResponse, verifiedResponse } from '../utils/shared/responses';
import {
  IauthResolver,
  IisValidUser,
  IVerifiedResponse,
} from '../types/authType';
import isValidUser from '../utils/isValid';
import sendOtp from '../utils/sendOtp';
import sendOtpMail from '../utils/sendOtpMail';

export const SignUp = async (args: SingleuserType): Promise<IauthResolver> => {
  try {
    const isUserExist: any = await findFromDB(User, 'One', {
      email: args?.email,
    });
    if (!isUserExist?.email) {
      const password: string = await hash(args?.password, 12);
      const user: Promise<SingleuserType> | any = await addToDB(User, {
        ...args,
        password,
      });

      if (user.email) {
        const token: string = sign(
          JSON.stringify({ userId: user.id, userEmail: user.email }),
          `${process.env.JWT_SECRET}`,
        );
        return authResponse('Sign Up successfully', user, token, false, 200);
      }
      return authResponse('Sign Up failed');
    }
    return authResponse('User already exist', null, '', true, 409);
  } catch (error) {
    return authResponse('Something went wrong');
  }
};

export const Login = async (args: SingleuserType): Promise<IauthResolver> => {
  try {
    const isUserExist: any = await findFromDB(User, 'One', { ...args });
    if (isUserExist?.email) {
      const comparePassword: boolean = await compare(
        args?.password,
        isUserExist?.password,
      );
      if (comparePassword) {
        const token: string = sign(
          JSON.stringify({
            userId: isUserExist.id,
            userEmail: isUserExist.email,
          }),
          `${process.env.JWT_SECRET}`,
        );
        return authResponse(
          'Logged In successfully',
          isUserExist,
          token,
          false,
          200,
        );
      }
      return authResponse('Invalid credentials!');
    }
    return authResponse('User not Found');
  } catch (error) {
    return authResponse(`failed to Logged in ${error}`);
  }
};

export const SendOtpNumber = async (
  args: { phoneNumber: string },
  token: string,
): Promise<IVerifiedResponse> => {
  try {
    const { isValid, userId, data } = await isValidUser(null, token);
    if (isValid) {
      const otp = await sendOtp(data.phoneNumber);
      if (otp) {
        await UpdateToDB(User, userId, { otp }, true);
        return verifiedResponse('Otp sent successfully!', 200);
      }
      return verifiedResponse('Sending Otp failed !');
    }
    return verifiedResponse('Invalid User!');
  } catch (error) {
    return verifiedResponse(`Something went wrong! ${error}`);
  }
};

export const VerifyOtpNumber = async (
  args: { otp: string },
  token: string,
): Promise<IVerifiedResponse> => {
  try {
    const { isValid, userId } = await isValidUser(null, token);
    if (isValid) {
      const foundUser: any | SingleuserType = await findFromDB(User, 'One', {
        id: userId,
      });
      if (foundUser?.otp === args.otp) {
        await UpdateToDB(User, userId, { isPhoneVerified: true });
        return verifiedResponse(
          'Phone number verified Successfully!',
          200,
          true,
        );
      }
      return verifiedResponse('Phone enter correct otp!');
    }
    return verifiedResponse('Invalid user!');
  } catch (error) {
    return verifiedResponse('Something went wrong!');
  }
};

export const SendOtpEmail = async (
  args: { email: string },
  token: string,
): Promise<IVerifiedResponse> => {
  try {
    const { isValid, userId, data }: IisValidUser = await isValidUser(
      null,
      token,
    );
    if (isValid) {
      const otp: string | null = await sendOtpMail(data.email);
      if (otp) {
        await UpdateToDB(User, userId, { otp }, true);
        return verifiedResponse('Otp sent successfully!', 200);
      }
      return verifiedResponse('Sending Otp failed !');
    }
    return verifiedResponse('Invalid User!');
  } catch (error) {
    return verifiedResponse(`Something went wrong! ${error}`);
  }
};

export const VerifyEmail = async (
  args: { otp: number },
  token: string,
): Promise<IVerifiedResponse> => {
  try {
    const { isValid, userId } = await isValidUser(null, token);
    if (isValid) {
      const foundUser: any | SingleuserType = await findFromDB(User, 'One', {
        id: userId,
      });
      if (foundUser?.otp === args.otp) {
        await UpdateToDB(User, userId, { isEmailVerified: true });
        return verifiedResponse('Email verified Successfully!', 200, true);
      }
      return verifiedResponse('Phone enter correct otp!');
    }
    return verifiedResponse('Invalid user!');
  } catch (error) {
    return verifiedResponse('Something went wrong!');
  }
};
