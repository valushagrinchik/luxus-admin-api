import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ERROR_CODES, ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user?.password) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: ERROR_CODES.USER_NOT_FOUND,
        message: [ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND]],
      });
    }

    const match = bcrypt.compareSync(pass, user.password);
    if (!match) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: ERROR_CODES.USER_NOT_FOUND,
        message: [ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND]],
      });
    }

    const payload = { sub: user.id, name: user.email, role: user.role };
    return {
      id: user.id,
      email: user.email,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
