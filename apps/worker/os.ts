import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { existsSync } from "fs";

const BASE_WORKER_DIR = process.env.BASE_WORKER_DIR || "/tmp/bolty-worker";

// Ensure base directory exists
if (!existsSync(BASE_WORKER_DIR)) {
  await mkdir(BASE_WORKER_DIR, { recursive: true });
}

export async function onFileUpdate(filePath: string, fileContent: string) {
  try {
    const fullPath = join(BASE_WORKER_DIR, filePath);
    const dirPath = dirname(fullPath);

    // Ensure directory exists
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    console.log(`Writing file: ${fullPath}`);
    await Bun.write(fullPath, fileContent);
    console.log(`Successfully wrote file: ${filePath}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
}

export function onShellCommand(shellCommand: string) {
  try {
    // Handle compound commands with &&
    const commands = shellCommand.split("&&").map((cmd) => cmd.trim());

    for (const command of commands) {
      if (!command) continue;

      console.log(`Running command: ${command}`);

      // Parse command and arguments
      const args = command.split(" ").filter((arg) => arg.length > 0);
      let cmd = args[0];
      let cmdArgs = args.slice(1);

      // Handle npm commands with better dependency resolution
      if (cmd === "npm" && cmdArgs[0] === "install") {
        cmdArgs = ["install", "--legacy-peer-deps", "--no-audit"];
      }

      // Handle expo commands by using npx
      if (cmd === "expo") {
        cmd = "npx";
        cmdArgs = ["expo", ...cmdArgs];
      }

      const result = Bun.spawnSync({
        cmd: [cmd, ...cmdArgs],
        cwd: BASE_WORKER_DIR,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 300000, // 5 minutes timeout
      });

      if (result.stdout) {
        console.log("Output:", result.stdout.toString());
      }

      if (result.stderr) {
        console.error("Error:", result.stderr.toString());
      }

      // Log exit code
      if (result.exitCode !== 0) {
        console.error(
          `Command failed with exit code ${result.exitCode}: ${command}`,
        );

        // For npm install failures, try alternative approaches
        if (cmd === "npm" && cmdArgs[0] === "install") {
          console.log("Trying npm install with --force flag...");
          const retryResult = Bun.spawnSync({
            cmd: ["npm", "install", "--force"],
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
