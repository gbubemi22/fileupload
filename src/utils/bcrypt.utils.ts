import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class BcryptUtil {
  async hash(string: string) {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(string, salt);
    return hashed;
  }

  async compare(string: string, hash: string): Promise<boolean> {
    const result = await bcrypt.compare(string, hash);
    return result;
  }
}
