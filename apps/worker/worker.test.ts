import { expect, test } from "bun:test";
import { ArtifactProcessor } from "./parser";

test("Action with shell file", () => {
  const boltAction = `<boltArtifact>
          <boltAction type="shell">
              npm run start
          </boltAction>
          <boltAction type="file" filePath="src/index.js">
              console.log("Hello, world!");
          </boltAction>
      </boltArtifact>`;
  const artifactProcessor = new ArtifactProcessor(
    boltAction,
    (filePath, fileContent) => {
      expect(filePath).toBe("src/index.js");
      expect(fileContent).toContain('console.log("Hello, world!");');
    },
    (shellCommand) => {
      console.log(shellCommand);
      expect(shellCommand).toContain("npm run start");
    },
  );

  artifactProcessor.parse();
  artifactProcessor.parse();
  expect(artifactProcessor.currentArtifact).not.toContain("<boltAction>");
});

test("Action with appends", () => {
  const boltAction = `<boltArtifact>
          <boltAction type="shell">
              npm run start
          </boltAction>
          <boltAction type="file" filePath="src/index.js">
              console.log("Hello, world!");
          </boltAction>
      `;
  const artifactProcessor = new ArtifactProcessor(
    boltAction,
    (filePath, fileContent) => {
      expect(filePath).toBe("src/index.js");
      expect(fileContent).toContain('console.log("Hello, world!");');
    },
    (shellCommand) => {
      console.log(shellCommand);
      expect(shellCommand).toContain("npm run start");
    },
  );

  artifactProcessor.parse();
  artifactProcessor.append(`
        <boltAction type="shell">
            npm run start
        </boltAction>
    `);
  artifactProcessor.parse();
  artifactProcessor.parse();
  artifactProcessor.append(`
        <boltAction type="file" filePath="src/index.js">
            console.log("Hello, world!");
        </boltAction>
    `);
  artifactProcessor.parse();
  expect(artifactProcessor.currentArtifact).not.toContain("<boltAction>");
});
