import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../db/repositories/userRepository.js';
import { config } from '../config/index.js';

export const authService = {
  register: async (arg1, arg2, arg3, arg4) => {
    let email, password, fullName, role;
    if (typeof arg1 === 'object' && arg1 !== null) {
      email = arg1.email;
      password = arg1.password;
      fullName = arg1.fullName || arg1.name;
      role = arg1.role || 'operator';
    } else {
      fullName = arg1;
      email = arg2;
      password = arg3;
      role = arg4 || 'operator';
    }

    if (!email || !password) {
      throw new Error('Email and password are required for registration.');
    }

    const existing = userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('An account with this email address already exists.');
      err.status = 409;
      throw err;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const user = userRepository.create({
      id,
      email,
      passwordHash,
      fullName: fullName || email.split('@')[0],
      role
    });

    const token = authService.generateToken(user);
    return { user, token };
  },

  login: async (arg1, arg2) => {
    let email, password;
    if (typeof arg1 === 'object' && arg1 !== null) {
      email = arg1.email;
      password = arg1.password;
    } else {
      email = arg1;
      password = arg2;
    }

    if (!email || !password) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    const userRecord = userRepository.findByEmail(email);
    if (!userRecord) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    const passwordMatches = bcrypt.compareSync(password, userRecord.password_hash);
    if (!passwordMatches) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.full_name,
      fullName: userRecord.full_name,
      role: userRecord.role
    };

    const token = authService.generateToken(user);
    return { user, token };
  },

  generateToken: (user) => {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
};
