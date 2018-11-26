import { environment } from '@girin/environment';
import { Auth, loginRequired } from '../src';

import { TestUser } from './TestUser';


class Profile {
  @loginRequired()
  prototypeSecretInfo(_args: {}, context: any) {
    return 'prototype';
  }

  @loginRequired()
  static classSecretInfo(_source: null, _args: {}, context: any) {
    return 'class';
  }
}

environment.load(
  new Auth({
    userConstructor: TestUser,
    jwtSecretKey: 'FOOBAR'
  })
);

describe('auth decorators', () => {
  let user: TestUser = new TestUser();
  user.id = 'randomuserid';

  describe('loginRequired decorating a prototype', () => {
    it('throws errors when context is not given', () => {
      const profile = new Profile();
      expect(() => {
        profile.prototypeSecretInfo({}, null);
      }).toThrowError('Authentication Error: login required');
    });

    it('throws error when context has no user', () => {
      const profile = new Profile();
      expect(() => {
        profile.prototypeSecretInfo({}, {});
      }).toThrowError('Authentication Error: login required');
    });

    it('throws error when context.user is not an instance of BaseUser', () => {
      const profile = new Profile();
      expect(() => {
        profile.prototypeSecretInfo({}, { user: { secretInfo: 'prototype' } });
      }).toThrowError('Authentication Error: login required');
    });

    it('works fine when context and user exists', () => {
      const profile = new Profile();
      expect(profile.prototypeSecretInfo({}, { user })).toBe('prototype');
    });
  });

  describe('loginRequired decorating a class', () => {
    it('throws errors when context is not given', () => {
      expect(() => {
        Profile.classSecretInfo(null, {}, null);
      }).toThrowError('Authentication Error: login required');
    });

    it('throws error when context has no user', () => {
      expect(() => {
        Profile.classSecretInfo(null, {}, {});
      }).toThrowError('Authentication Error: login required');
    });

    it('throws error when context.user is not an instance of BaseUser', () => {
      expect(() => {
        Profile.classSecretInfo(null, {}, { user: { secretInfo: 'class' } });
      }).toThrowError('Authentication Error: login required');
    });

    it('works fine when context and user exists', () => {
      expect(Profile.classSecretInfo(null, {}, { user })).toBe('class');
    });
  });
});
