import { Provider } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { MODELS, SEQUELIZE } from './database.constants';
import { initModels } from './models';

const sequelize = require('../config/database.config');

export const databaseProviders: Provider[] = [
  {
    provide: SEQUELIZE,
    useFactory: async (): Promise<Sequelize> => {
      await sequelize.authenticate();
      return sequelize;
    },
  },
  {
    provide: MODELS,
    inject: [SEQUELIZE],
    useFactory: async (db: Sequelize) => {
      const models = initModels(db);
      const shouldSync = process.env.DB_SYNC === 'true';
      if (shouldSync) {
        await db.sync();
      }
      return models;
    },
  },
];
