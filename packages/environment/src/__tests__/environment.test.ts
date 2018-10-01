import { Module, Environment } from '..';


describe('Environment and modules', () => {
  it('can be bootstrapped with loaded modules', async () => {
    class TwelveModule extends Module<{}, number> {
      configure() {}
      bootstrap() {
        return 12;
      }
      destroy() {
        destroyOrder.push(this.constructor);
      }
    }

    class CountDownModule extends Module<{}, number[]> {
      configure() {}
      async bootstrap() {
        const number = await this.environment.bootstrap(TwelveModule);
        const counts: number[] = [];
        for (let i = number; i > 0; i--) { counts.push(i); }
        return counts;
      }
      destroy() {
        destroyOrder.push(this.constructor);
      }
    }
    const environment = new Environment();

    const countdownResult = await environment
      .load(TwelveModule, {})
      .load(CountDownModule, {})
      .bootstrap(CountDownModule);
    expect(countdownResult).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);

    const destroyOrder: Function[] = []
    await environment.destroy();
    expect(destroyOrder).toEqual([CountDownModule, TwelveModule]);
  });
});
