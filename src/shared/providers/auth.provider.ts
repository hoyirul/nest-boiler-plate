import { Injectable, Scope } from '@nestjs/common';
import { ValidationError } from '@/shared/utils/errors';

@Injectable({ scope: Scope.REQUEST })
export class AuthProvider {
  private user: any;

  setUser(user: any) {
    this.user = user;
  }

  getUser() {
    if (!this.user) throw ValidationError('api.common.validation_failed', {
      auth: 'api.common.user_not_set_in_auth_provider',
    });
    return this.user;
  }
}