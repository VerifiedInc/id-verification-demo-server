import { MikroORM } from '@mikro-orm/core';

import mikroOrmConfig from './mikro-orm.config';
import { Application } from './declarations';

export async function setupMikroOrm (app: Application): Promise<void> {
  const orm = await MikroORM.init(mikroOrmConfig);

  app.set('orm', orm);
}
