import createServer from './create-server';
import deleteServer from './delete-server';
import restartServer from './restart-server';
import saveServerConfig from './save-server-config';
import startServer from './start-server';
import stopServer from './stop-server';

export default {
  Mutation: {
    createServer,
    deleteServer,
    restartServer,
    saveServerConfig,
    startServer,
    stopServer
  }
};
