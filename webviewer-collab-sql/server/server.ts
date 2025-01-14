import CollabServer from "@pdftron/collab-server";
import Resolvers from "./resolvers";
import GetDB from "./db";
const dotenv = require("dotenv");
const port = 3000;
dotenv.config();

(async () => {
  await GetDB();

  const corsOption = {
    origin: true,
    credentials: true,
  };

  const server = new CollabServer({
    resolvers: Resolvers,
    corsOption,
  });

  server.start(port);
})();
