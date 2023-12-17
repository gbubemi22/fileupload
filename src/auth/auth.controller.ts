import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpStatus,
  HttpCode,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from 'src/user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users/register')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    try {
      const result = await this.authService.creatUser({
        username: dto.username,
        email: dto.email,
        password: dto.password,
      });
      return {
        message: 'User account created successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        return {
          message: 'Failed to create user account',
          error: error.message,
        };
      }
      throw error;
    }
  }

  //   USER LOGIN
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    const token = await this.authService.login(loginDto);
    return token;
  }
}
