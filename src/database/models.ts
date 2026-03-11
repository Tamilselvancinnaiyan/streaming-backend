import { DataTypes, Sequelize } from 'sequelize';

export type AppModels = ReturnType<typeof initModels>;

export function initModels(sequelize: Sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(180),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('viewer', 'host', 'admin'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    { tableName: 'users', underscored: true, timestamps: true },
  );

  const Stream = sequelize.define(
    'Stream',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      hostUserId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      roomId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: 'general',
      },
      status: {
        type: DataTypes.ENUM('live', 'ended'),
        allowNull: false,
        defaultValue: 'live',
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    { tableName: 'streams', underscored: true, timestamps: true },
  );

  User.hasMany(Stream, { foreignKey: 'hostUserId', as: 'streams' });
  Stream.belongsTo(User, { foreignKey: 'hostUserId', as: 'host' });

  return { User, Stream };
}
