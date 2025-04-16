import { io, Socket } from "socket.io-client";

const COMPANION_IP = "localhost";
const COMPANION_PORT = 9999;

let interval = -1;

async function main() {
  function sendUpdateToCompanion(
    socket: Socket,
    Player: typeof Spicetify.Player
  ) {
    // Wait for queue to update
    return setTimeout(() => {
      const curPos = Player.getProgress();
      socket.emit("spotify:update:position", curPos);
      socket.emit("spotify:update:state", Player.data);
    }, 300);
  }

  console.info("Starting.");

  // The following code segment waits for platform to load before running the code, this is important to avoid errors. When using things such as Player or URI, it is necessary to add those as well.
  const { Platform, Player } = Spicetify;
  if (!Spicetify.CosmosAsync || !Platform.LibraryAPI || !Platform || !Player) {
    console.info("Restarting");
    setTimeout(main, 500);
    return;
  }

  const url = `http://${COMPANION_IP}:${COMPANION_PORT}`;
  console.info(`Connecting to ${url}`);
  const socket = io(url, {
    transports: ["websocket"],
  });

  // remove any existing listeners (in case of hot reload)
  socket.off();

  if (interval) clearInterval(interval);

  socket.on("connect", () => {
    console.info("Connected.");
  });

  socket.on("connect_error", (e: Error) => {
    console.info("Connection error.");
    console.error(e);
  });

  socket.on("disconnect", () => {
    if (interval) clearInterval(interval);
    console.info("Disconnected.");
  });

  socket.io.on("reconnect", (attempt) => {
    console.info("Reconnected.");
  });

  socket.io.on("reconnect_attempt", () => {
    console.info("Reconnection attempt.");
  });

  socket.io.on("open", () => {
    console.info("Socket open.");
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      const curPos = Player.getProgress();
      socket.emit("spotify:update:position", curPos);
    }, 1000);
  });

  socket.on("spotify:delete:nextSong", () => {
    if (Player.data.nextItems?.length) {
      const uri = Player.data.nextItems[0].uri;
      const track: Spicetify.ContextTrack[] = [
        {
          uri,
        },
      ];
      Spicetify.removeFromQueue(track);
      sendUpdateToCompanion(socket, Player);
    }
  });

  socket.on("spotify:update:queue", (uri: string) => {
    const track: Spicetify.ContextTrack[] = [
      {
        uri,
      },
    ];
    Platform.PlayerAPI.addToQueue(track);

    sendUpdateToCompanion(socket, Player);
  });

  socket.on("spotify:delete:queue", (uri?: string) => {
    if (uri) {
      const track: Spicetify.ContextTrack[] = [
        {
          uri,
        },
      ];
      Platform.PlayerAPI.removeFromQueue(track);
    } else {
      Platform.PlayerAPI.clearQueue();
    }
    sendUpdateToCompanion(socket, Player);
  });

  socket.on("spotify:create:queue", (uri: string) => {
    Player.playUri(uri);
    sendUpdateToCompanion(socket, Player);
  });

  socket.on("spotify:read:state", () => {
    sendUpdateToCompanion(socket, Player);
  });

  Player.addEventListener(
    "songchange",
    (
      event?: Event & {
        data: Spicetify.PlayerState;
      }
    ) => {
      sendUpdateToCompanion(socket, Player);
    }
  );
  Player.addEventListener(
    "onplaypause",
    (
      event?: Event & {
        data: Spicetify.PlayerState;
      }
    ) => {
      sendUpdateToCompanion(socket, Player);
    }
  );
}

export default main;
