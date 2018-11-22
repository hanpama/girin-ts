import { Model, Embed, field, embedOne, embedMany } from '../src';
import { prepareTestEnv, cleanUpTestEnv } from './testenv';


export class Profile extends Embed {
  @field() bio: string;
}

export class EmailEntry extends Embed {
  @field() email: string;
  @field() verified: boolean;
}

export class User extends Model {
  static collectionName = 'embed_users';

  @field() username: string;
  @embedOne(Profile) profile: Profile;
  @embedMany(EmailEntry) emails: EmailEntry[];
}


describe('embed', () => {
  beforeAll(prepareTestEnv);
  afterAll(async () => {
    await User.getManager().db.dropCollection(User.collectionName);
    await cleanUpTestEnv();
  });


  it('allows to assign embedded documents to the container', async () => {
    const user = new User();
    user.username = 'foobar';

    const profile = new Profile();
    profile.bio = 'foobarbaz';

    const email1 = new EmailEntry({
      email: 'foo@example.com',
      verified: true,
    });
    const email2 = new EmailEntry({
      email: 'bar@example.com',
      verified: false,
    });

    user.profile = profile;
    user.emails = [email1, email2];

    await user.$save();

    const fetchedUser = await User.getOne(user._id) as User;
    expect(fetchedUser.$source).toEqual({
      _id: user._id,
      username: 'foobar',
      profile: {
        bio: 'foobarbaz',
      },
      emails: [{
        email: 'foo@example.com',
        verified: true,
      }, {
        email: 'bar@example.com',
        verified: false,
      }],
    });

    expect(fetchedUser.profile.$source).toEqual(user.profile.$source);
    expect(fetchedUser.emails[0].$source).toEqual(user.emails[0].$source);
    expect(fetchedUser.emails[1].$source).toEqual(user.emails[1].$source);
  });
});
