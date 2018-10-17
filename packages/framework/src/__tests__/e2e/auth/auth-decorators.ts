import { loginRequired } from '../../../auth-local/decorators';
import { AuthLocalModule } from '../../../auth-local';


class Profile {
  @loginRequired()
  prototypeSecretInfo(_args: {}, context: any) {
    return context.user.username;
  }

  @loginRequired()
  static classSecretInfo(_source: null, _args: {}, context: any) {
    return context.user.username;
  }
}

export function testAuthDecorators() {
  const mod = AuthLocalModule.object();
  const user = mod.createUserInstance('testusername', 'verystrongpassword');

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
        profile.prototypeSecretInfo({}, { user: { secretInfo: 'testusername' } });
      }).toThrowError('Authentication Error: login required');
    });

    it('works fine when context and user exists', () => {
      const profile = new Profile();
      expect(profile.prototypeSecretInfo({}, { user })).toBe('testusername');
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
        Profile.classSecretInfo(null, {}, { user: { secretInfo: 'testusername' } });
      }).toThrowError('Authentication Error: login required');
    });

    it('works fine when context and user exists', () => {
      expect(Profile.classSecretInfo(null, {}, { user })).toBe('testusername');
    });
  });
}
