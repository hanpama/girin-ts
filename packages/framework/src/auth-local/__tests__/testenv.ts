import { environment } from "@girin/environment";


class ServerModule {
  get label() { return 'ServerModule' };
  bootstrap() {}
  destroy() {}
  context(ctx: any) { return ctx; }
}

export function prepareTestEnv() {
  return environment.load(new ServerModule());
}
