import AutoTKWarn from './auto-tk-warn.js';
import ChatCommands from './chat-commands.js';
import DiscordAdminBroadcast from './discord-admin-broadcast.js';
import DiscordAdminCamLogs from './discord-admin-cam-logs.js';
import DiscordAdminRequest from './discord-admin-request.js';
import DiscordChat from './discord-chat.js';
import DiscordRcon from './discord-rcon.js';
import DiscordSubsystemRestarter from './discord-subsystem-restarter.js';
import IntervalledBroadcasts from './intervalled-broadcasts.js';
import SeedingMode from './seeding-mode.js';
import DiscordServerStatus from './discord-server-status.js';
import DiscordPlayersList from './discord-players-list.js';
import DiscordServerLayerImages from './discord-server-layer-images.js';

const plugins = [
  AutoTKWarn,
  ChatCommands,
  DiscordAdminBroadcast,
  DiscordAdminCamLogs,
  DiscordAdminRequest,
  DiscordChat,
  DiscordRcon,
  DiscordSubsystemRestarter,
  IntervalledBroadcasts,
  SeedingMode,
  DiscordServerStatus,
  DiscordPlayersList,
  DiscordServerLayerImages
];

const pluginsByName = {};
for (const plugin of plugins) {
  pluginsByName[plugin.name] = plugin;
}

export default pluginsByName;
