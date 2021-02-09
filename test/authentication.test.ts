import generateApp from '../src/app';

describe('authentication', () => {
  it('registered the authentication service', async () => {
    const app = await generateApp();
    expect(app.service('authentication')).toBeTruthy();
  });
});
