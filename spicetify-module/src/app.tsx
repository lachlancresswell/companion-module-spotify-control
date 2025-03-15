import { io, Socket } from "socket.io-client";

let interval = -1;

// The async modifier allows for the user of await, which converts a promise into an object, when not using await, async is not necessary.
async function main() {
  // The following code segment waits for platform to load before running the code, this is important to avoid errors. When using things such as Player or URI, it is necessary to add those as well.
  const { Platform } = Spicetify;
  if (!Spicetify.CosmosAsync || !Platform.LibraryAPI || !Platform) {
    setTimeout(main, 500);
    return;
  }

  const socket = io("http://localhost:9999", {
    transports: ["websocket"],
  });

  // remove any existing listeners (in case of hot reload)
  socket.off();

  if (interval) clearInterval(interval);

  socket.on("disconnect", () => {
    if (interval) clearInterval(interval);
    console.info("disconnected");
  });

  socket.io.on("reconnect", (attempt) => {
    console.info("reconnect");
  });

  socket.io.on("open", () => {
    console.info("open");

    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      const curPos = Spicetify.Player.getProgress();
      socket.emit("spotify:update:position", curPos);
      console.info("spotify:update:position ", curPos, interval);
    }, 500);
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    console.info("reconnect_attempt");
  });

  socket.io.on("reconnect_error", (error) => {
    console.error("reconnect_error");
  });

  socket.io.on("reconnect_failed", () => {
    console.error("reconnect_failed");
  });

  socket.io.on("ping", () => {
    console.info("ping");
  });

  socket.on("spotify:delete:nextSong", () => {
    console.info("spotify:delete:nextSong");
    if (Spicetify.Player.data.nextItems?.length) {
      const uri = Spicetify.Player.data.nextItems[0].uri;
      const track: Spicetify.ContextTrack[] = [
        {
          uri,
        },
      ];
      console.info("Clearing from queue", uri);
      Spicetify.removeFromQueue(track);
      setTimeout(() => {
        update(socket);
      }, 300);
    }
  });

  socket.on("spotify:update:queue", (uri: string) => {
    const track: Spicetify.ContextTrack[] = [
      {
        uri,
      },
    ];
    console.info("Adding to queue ", track);
    Spicetify.Platform.PlayerAPI.addToQueue(track);
    setTimeout(() => {
      update(socket);
    }, 300);
  });

  socket.on("spotify:delete:queue", (uri?: string) => {
    if (uri) {
      const track: Spicetify.ContextTrack[] = [
        {
          uri,
        },
      ];
      console.info("Clearing from queue", uri);
      Spicetify.Platform.PlayerAPI.removeFromQueue(track);
      setTimeout(() => {
        update(socket);
      }, 300);
    } else {
      console.info("Clearing queue");
      Spicetify.Platform.PlayerAPI.clearQueue();
      setTimeout(() => {
        update(socket);
      }, 300);
    }
  });

  socket.on("spotify:create:queue", (uri: string) => {
    console.info("Playing", uri);
    Spicetify.Player.playUri(uri);
    setTimeout(() => {
      update(socket);
    }, 300);
  });

  socket.on("spotify:read:state", () => {
    update(socket);
  });

  Spicetify.Player.addEventListener(
    "songchange",
    (
      event?: Event & {
        data: Spicetify.PlayerState;
      }
    ) => {
      update(socket);
    }
  );
  Spicetify.Player.addEventListener(
    "onplaypause",
    (
      event?: Event & {
        data: Spicetify.PlayerState;
      }
    ) => {
      update(socket);
    }
  );

  console.info("ready");
}

export default main;

function update(socket: Socket) {
  const curPos = Spicetify.Player.getProgress();
  socket.emit("spotify:update:position", curPos);
  socket.emit("spotify:update:state", Spicetify.Player.data);
}
