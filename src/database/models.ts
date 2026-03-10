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
      displayName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      avatarUrl: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('host', 'viewer', 'admin'),
        allowNull: false,
        defaultValue: 'viewer',
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
      hostId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      roomName: {
        type: DataTypes.STRING(120),
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
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      thumbnailUrl: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private', 'unlisted'),
        allowNull: false,
        defaultValue: 'public',
      },
      status: {
        type: DataTypes.ENUM('draft', 'live', 'ended'),
        allowNull: false,
        defaultValue: 'draft',
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      livekitRoomSid: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      streamUrl: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      shareLink: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      embedCode: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { tableName: 'streams', underscored: true, timestamps: true },
  );

  const StreamParticipant = sequelize.define(
    'StreamParticipant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      streamId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      identity: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('host', 'cohost', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      leftAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'stream_participants',
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ['stream_id', 'identity'], unique: true }],
    },
  );

  const ChatMessage = sequelize.define(
    'ChatMessage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      streamId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      avatarUrl: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      messageType: {
        type: DataTypes.ENUM('normal', 'super_chat', 'pinned', 'system'),
        allowNull: false,
        defaultValue: 'normal',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      isHighlighted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reactions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    { tableName: 'chat_messages', underscored: true, timestamps: true },
  );

  const StreamEvent = sequelize.define(
    'StreamEvent',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      streamId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      actorUserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      eventType: {
        type: DataTypes.ENUM(
          'start_stream',
          'stop_stream',
          'mute_mic',
          'unmute_mic',
          'toggle_camera',
          'screen_share',
          'invite_cohost',
          'record_stream',
          'pin_message',
          'ban_user',
          'highlight_message',
        ),
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    { tableName: 'stream_events', underscored: true, timestamps: true },
  );

  const Follow = sequelize.define(
    'Follow',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      hostUserId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'follows',
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ['user_id', 'host_user_id'], unique: true }],
    },
  );

  User.hasMany(Stream, { foreignKey: 'hostId', as: 'hostedStreams' });
  Stream.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

  Stream.hasMany(StreamParticipant, { foreignKey: 'streamId', as: 'participants' });
  StreamParticipant.belongsTo(Stream, { foreignKey: 'streamId', as: 'stream' });

  Stream.hasMany(ChatMessage, { foreignKey: 'streamId', as: 'messages' });
  ChatMessage.belongsTo(Stream, { foreignKey: 'streamId', as: 'stream' });

  Stream.hasMany(StreamEvent, { foreignKey: 'streamId', as: 'events' });
  StreamEvent.belongsTo(Stream, { foreignKey: 'streamId', as: 'stream' });

  return { User, Stream, StreamParticipant, ChatMessage, StreamEvent, Follow };
}
