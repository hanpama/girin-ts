import { loginRequired } from "../decorators";
import { prepareTestEnv } from "./testenv";
import { AuthLocalModule, User } from "..";
import { environment } from "@girin/environment";


class Profile {
  @loginRequired()
  prototypeSecretInfo(_args: {}, context: any) {
    return context.user.secretInfo;
  }

  @loginRequired()
  static classSecretInfo(_source: null, _args: {}, context: any) {
    return context.user.secretInfo;
  }
}

class TestUser extends User {
  id: number;
  hashedPassword: string;
  get secretInfo() { return 'hi'; }
}


const testUserStorage: TestUser[] = [];

export class TestAuthModule extends AuthLocalModule<TestUser> {
  async bootstrap() {}
  async deserializeUserInstance(ser: { id: number }) {
    const user = testUserStorage.find(user => user.id === ser.id);
    if (!user) { throw new Error('Authentication Error'); }
    return user;
  }
  serializeUserInstance(user: TestUser) {
    return { id: user.id };
  }
}


describe('decorators', () => {

  prepareTestEnv().load(new TestAuthModule({
    JWT_SECRET_KEY: 'Foobar',
    USER: TestUser,
  }))

  describe('loginRequired decorating a prototype', () => {
    console.log(environment);

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
        profile.prototypeSecretInfo({}, { user: { secretInfo: 'hi' } })
      }).toThrowError('Authentication Error: login required');
    })

    it('works fine when context and user exists', () => {
      const profile = new Profile();
      expect(profile.prototypeSecretInfo({}, { user: new TestUser() })).toBe('hi');
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
        Profile.classSecretInfo(null, {}, { user: { secretInfo: 'hi' } })
      }).toThrowError('Authentication Error: login required');
    })

    it('works fine when context and user exists', () => {
      expect(Profile.classSecretInfo(null, {}, { user: new TestUser() })).toBe('hi');
    });
  });
});
