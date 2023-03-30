import { PrismaClient } from "@marble/db";
import { describe, beforeEach, beforeAll, it, afterAll, expect } from "vitest";
import Docker from "dockerode";
import getPort from "get-port";
import { uid } from "@/utils/uid";

interface Context {
  docker: Docker;
  mysqlContainer: Docker.Container;
  prisma: PrismaClient;
}

async function createDockerDB() {
  const docker = new Docker();
  const port = await getPort({ port: 3306 });
  const image = "mysql:8";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pullStream = await docker.pull(image);

  await new Promise((resolve, reject) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    docker.modem.followProgress(pullStream, (err) =>
      err ? reject(err) : resolve(err)
    )
  );

  const mysqlContainer = await docker.createContainer({
    Image: image,
    Env: ["MYSQL_ROOT_PASSWORD=mysql", "MYSQL_DATABASE=marble"],
    name: `marble-integration-tests-${uid()}`,
    HostConfig: {
      AutoRemove: true,
      PortBindings: {
        "3306/tcp": [{ HostPort: `${port}` }],
      },
    },
  });

  await mysqlContainer.start();

  return {
    connectionString: `mysql://root:mysql@127.0.0.1:${port}/marble`,
    mysqlContainer,
  };
}

describe("new-ledger use case", () => {
  let connectionString: string;
  let prisma: PrismaClient;
  let mysqlContainer: Docker.Container;

  beforeAll(async () => {
    const {
      connectionString: mysqlConnectionString,
      mysqlContainer: container,
    } = await createDockerDB();

    connectionString = mysqlConnectionString;
    mysqlContainer = container;

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });
  });

  beforeEach<Context>((ctx) => {
    ctx.prisma = prisma;
  });

  it<Context>("creates a new ledger", (ctx) => {
    expect(1).toBe(1);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await mysqlContainer.stop();
  }, 30000);
});
