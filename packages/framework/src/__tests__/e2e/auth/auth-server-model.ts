import { AuthLocalModule } from "../../../auth-local";


export function testAuthServerModel() {

  it('should authenticate and work with jwt', async () => {
    const userModule = AuthLocalModule.object();
    const user = await userModule.createUserInstance('mytestaccount', 'mystrongpassword');

    // save user to database
    await user.$save();

    // with the right password
    let maybeAuthenticated = await userModule.authenticate(user, 'mystrongpassword');
    expect(maybeAuthenticated).toBeTruthy();

    // with a wrong password
    let maybeNotAuthenticated = await userModule.authenticate(user, 'mywrongpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // creating token
    const token = await userModule.encodeToken(user);
    const userFromToken = await userModule.decodeToken(token);

    expect(userFromToken.id).toEqual(user.id);

    // change password
    await userModule.setPassword(user, 'iamchangingmypassword');

    // with old one
    maybeNotAuthenticated = await userModule.authenticate(user, 'mystrongpassword')
    expect(maybeNotAuthenticated).toBeFalsy();

    // with new one
    maybeAuthenticated = await userModule.authenticate(user, 'iamchangingmypassword');
    expect(maybeAuthenticated).toBeTruthy();
  });
}
