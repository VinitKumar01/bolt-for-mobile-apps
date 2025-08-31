import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { existsSync } from "fs";
import { prismaClient } from "db/client";

const BASE_WORKER_DIR = process.env.BASE_WORKER_DIR || "/tmp/bolty-worker";

if (!existsSync(BASE_WORKER_DIR)) {
  await mkdir(BASE_WORKER_DIR, { recursive: true });
}

export async function onFileUpdate(
  filePath: string,
  fileContent: string,
  projectId: string,
  promptId: string,
) {
  try {
    const fullPath = join(BASE_WORKER_DIR, filePath);
    const dirPath = dirname(fullPath);

    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    console.log(`Writing file: ${fullPath}`);
    await Bun.write(fullPath, fileContent);
    await prismaClient.action.create({
      data: {
        projectId,
        content: `Updated file: ${filePath}`,
        promptId,
      },
    });
    console.log(`Successfully wrote file: ${filePath}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
}

export async function onShellCommand(
  shellCommand: string,
  projectId: string,
  promptId: string,
) {
  try {
    const commands = shellCommand.split("&&").map((cmd) => cmd.trim());

    for (const command of commands) {
      if (!command) continue;

      console.log(`Running command: ${command}`);

      const args = command.split(" ").filter((arg) => arg.length > 0);
      let cmd = args[0] as string;
      let cmdArgs = args.slice(1);

      if (cmd === "npm" && cmdArgs[0] === "install") {
        if (cmd === "npm" && cmdArgs[0] === "install") {
          cmdArgs = [
            "install",
            "--legacy-peer-deps",
            "--no-audit",
            ...cmdArgs.slice(1),
          ];
        }
      }

      if (cmd === "expo") {
        cmd = "npx";
        cmdArgs = ["expo", ...cmdArgs];
      }

      const result = Bun.spawnSync({
        cmd: [cmd, ...cmdArgs],
        cwd: BASE_WORKER_DIR,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 300000,
      });

      await prismaClient.action.create({
        data: {
          projectId,
          content: `Ran command: ${command}`,
          promptId,
        },
      });

      if (result.stdout) {
        console.log("Output:", result.stdout.toString());
      }

      if (result.stderr && result.exitCode === 1) {
        console.error("Error:", result.stderr.toString());
      }

      if (result.exitCode !== 0) {
        console.warn(`Command might failed: ${command}`);

        if (
          cmd === "npm" &&
          cmdArgs[0] === "install" &&
          !cmdArgs.includes("--force")
        ) {
          console.log("Trying npm install with --force flag...");
          const retryResult = Bun.spawnSync({
            cmd: ["npm", "install", "--force", ...cmdArgs.slice(1)],
            cwd: BASE_WORKER_DIR,
            stdout: "pipe",
            stderr: "pipe",
          });

          if (retryResult.exitCode === 0) {
            console.log("npm install succeeded with --force flag");
          }
        }
      } else {
        console.log(`Command completed successfully: ${command}`);
      }
    }
  } catch (error) {
    console.error(`Error executing shell command "${shellCommand}":`, error);
  }
}
