import { Module, environment } from '..';


describe('Environment and modules', () => {

  class TwelveModule extends Module<number> {
    configure() {}
    bootstrap() {
      return 12;
    }
    destroy() {
      destroyOrder.push(this.constructor);
    }
  }

  class CountDownModule extends Module<number[]> {
    configure() {
      TwelveModule.object();
    }
    async bootstrap() {

      const num = await TwelveModule.bootstrap();
      const counts: number[] = [];
      for (let i = num; i > 0; i--) { counts.push(i); }
      return counts;
    }
    destroy() {
      destroyOrder.push(this.constructor);
    }
  }
  const destroyOrder: any[] = [];

  it('can be bootstrapped with loaded modules', async () => {
    await environment
      .load(new TwelveModule())
      .load(new CountDownModule());

    const countdownResult = await CountDownModule.bootstrap();

    expect(countdownResult).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('can get a module instance by its label', () => {
    expect(CountDownModule.object()).toBeInstanceOf(CountDownModule);
  });

  it('throws an error when given label has no corresponding module', () => {
    class ModuleNotLoaded extends Module<void> {
      bootstrap() {}
    }
    expect(() => ModuleNotLoaded.object()).toThrowError(`Cannot find module in environment: ModuleNotLoaded`);
  });

  it('destroy modules in reverse of their bootstrap order', async () => {
    await environment.destroy();
    expect(destroyOrder).toEqual([CountDownModule, TwelveModule]);
  });

  it('runs bootstrapping modules in loaded order', async () => {
    const countdownResult = await environment
      .load(new TwelveModule())
      .load(new CountDownModule())
      .run();
    expect(countdownResult).toEqual({
      TwelveModule: 12,
      CountDownModule: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    });
  });
});
