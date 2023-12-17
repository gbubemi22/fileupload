import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from 'src/user/dto/login-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import BcryptUtil from 'src/utils/bcrypt.utils';
import { jwtConfig } from './gurad/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly bcryptUtil: BcryptUtil,
    private readonly jwtService: JwtService,
  ) {}

  ValidatePasswordString = (password: string) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

    if (!password.match(regex)) {
      throw new BadRequestException(
        'Password must contain a capital letter, number, special character & be between 8 and 20 characters long.',
      );
    }

    return true;
  };
  async creatUser(dto: CreateUserDto): Promise<User> {
    const { username, password, email } = dto;

    const checkemail = await this.userService.findUserByEmail(email);

    if (checkemail) {
      throw new ConflictException(
        ` user with this email address already exists`,
      );
    }

    const checkUser = await this.userService.findUserByUsername(username);

    if (checkUser) {
      throw new ConflictException(` user with this username  already exists`);
    }

    this.ValidatePasswordString(password);

    const hashedPassword = await this.bcryptUtil.hash(dto.password);

    dto.password = hashedPassword;

    try {
      const createdUser = await this.userService.create(dto);

      return createdUser;
    } catch (error) {
      console.error('Failed to register user:', error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  // LOGIN
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { username, password } = loginDto;

    // Validate the loginDto object.
    if (!username || !password) {
      throw new BadRequestException('Invalid login credentials!');
    }

    // Get the user from the database.
    const userData = await this.userService.findUserByUsername(username);

    // Check if the user exists and compare the passwords.
    if (
      !userData ||
      !(await this.bcryptUtil.compare(loginDto.password, userData.password))
    ) {
      throw new UnauthorizedException('Credentials invalid!');
    }

    // Generate the access token.
    const token = this.generateAccessToken(userData);

    return { token };
  }

  // GENERATE ACCESS TOKEN
  generateAccessToken(user: User): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      expiresIn: jwtConfig.expiresIn,
      secret: jwtConfig.secret,
    });
  }

  // VERIFY TOKEN
  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Token verification failed');
      }
    }
  }
}
