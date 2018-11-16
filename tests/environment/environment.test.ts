import { Module, environment } from '@girin/environment';


describe('Environment and modules', () => {
  let bootstrapOrder: any[] = [];
  let destroyOrder: any[] = [];

  class TwelveModule extends Module {
    onBootstrap() {
      bootstrapOrder.push(this.constructor);
      this.result = 12;
    }
    onDestroy() {
      destroyOrder.push(this.constructor);
    }

    public result: number;
  }

  class CountDownModule extends Module {
    async onBootstrap() {
      bootstrapOrder.push(this.constructor);

      await TwelveModule.bootstrap();
      const num = TwelveModule.object().result;

      for (let i = num; i > 0; i--) { this.counts.push(i); }
    }
    onDestroy() {
      destroyOrder.push(this.constructor);
    }

    counts: number[] = [];
  }


  afterEach(async () => {
    await environment.destroy();
    destroyOrder = [];
    bootstrapOrder = [];
  });

  it('can be bootstrapped with loaded modules', async () => {
    await environment
      .load(new TwelveModule())
      .load(new CountDownModule())
      .run();

    const countdownResult = CountDownModule.object().counts;
    expect(bootstrapOrder).toEqual([CountDownModule, TwelveModule]);
    expect(countdownResult).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('can get a module instance by its label', async () => {
    await environment
      .load(new TwelveModule())
      .load(new CountDownModule());

    expect(CountDownModule.object()).toBeInstanceOf(CountDownModule);
  });

  it('throws an error when given label has no corresponding module', async () => {
    await environment
      .load(new TwelveModule())
      .load(new CountDownModule());

    class ModuleNotLoaded extends Module {
      bootstrap() {}
    }
    expect(() => ModuleNotLoaded.object()).toThrowError(`Cannot find module in environment: ModuleNotLoaded`);
  });

  it('destroys modules in reverse of their bootstrap order', async () => {
    await environment
      .load(new TwelveModule())
      .load(new CountDownModule())
      .run();

    await environment.destroy();
    expect(destroyOrder).toEqual([CountDownModule, TwelveModule]);
  });

  it('destroys modules already bootstrapped when a module throws errors while bootstrapping', async () => {
    class ErroneousModule extends Module {
      onBootstrap() {
        bootstrapOrder.push(this.constructor);
        throw new Error(`I don't like it!`);
      }
    }
    environment
      .load(new ErroneousModule())
      .load(new TwelveModule())
      .load(new CountDownModule());

    const runPromise = environment.run();
    expect(runPromise).rejects.toThrow(`I don't like it!`);

    try {
      await runPromise;
    } catch (e) {
      // pass
    }

    expect(bootstrapOrder).toEqual([CountDownModule, TwelveModule, ErroneousModule]);
    expect(destroyOrder).toEqual([CountDownModule, TwelveModule]);
  });

});
