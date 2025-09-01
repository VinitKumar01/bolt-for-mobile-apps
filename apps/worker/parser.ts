export class ArtifactProcessor {
  public currentArtifact: string;
  private onFileContent: (
    filePath: string,
    fileContent: string,
    projectId: string,
    promptId: string,
  ) => void;
  private projectId: string;
  private promptId: string;
  private onShellCommand: (
    shellCommand: string,
    projectId: string,
    promptId: string,
  ) => void;
  private processedActions: Set<string> = new Set();

  constructor(
    currentArtifact: string,
    onFileContent: (
      filePath: string,
      fileContent: string,
      projectId: string,
      promptId: string,
    ) => void,
    onShellCommand: (
      shellCommand: string,
      projectId: string,
      promptId: string,
    ) => void,
    projectId: string,
    promptId: string,
  ) {
    this.currentArtifact = currentArtifact;
    this.onFileContent = onFileContent;
    this.onShellCommand = onShellCommand;
    this.projectId = projectId;
    this.promptId = promptId;
  }

  append(artifact: string) {
    this.currentArtifact += artifact;
  }

  parse() {
    try {
      let content = this.currentArtifact;

      const codeBlockMatch = content.match(
        /```(?:xml|html)?\s*([\s\S]*?)\s*```/,
      );
      if (codeBlockMatch) {
        content = codeBlockMatch[1] as string;
      }

      const artifactMatch = content.match(
        /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/,
      );
      if (!artifactMatch) {
        return;
      }

      const artifactContent = artifactMatch[1] as string;

      const actionRegex = /<boltAction\s+([^>]*?)>([\s\S]*?)<\/boltAction>/g;
      let match;

      while ((match = actionRegex.exec(artifactContent)) !== null) {
        const attributes = match[1] as string;
        const actionContent = match[2] as string;

        const actionId = `${attributes}-${actionContent.substring(0, 50)}`;

        if (this.processedActions.has(actionId)) {
          continue;
        }

        const typeMatch = attributes.match(/type=["']([^"']+)["']/);
        const filePathMatch = attributes.match(/filePath=["']([^"']+)["']/);

        if (!typeMatch) {
          continue;
        }

        const actionType = typeMatch[1];

        if (actionType === "shell") {
          const shellCommand = actionContent.trim();
          if (shellCommand) {
            console.log(`Executing shell command: ${shellCommand}`);
            this.onShellCommand(shellCommand, this.projectId, this.promptId);
            this.processedActions.add(actionId);
          }
        } else if (actionType === "file") {
          if (filePathMatch) {
            const filePath = filePathMatch[1];
            const fileContent = actionContent.trim();

            if (filePath && fileContent) {
              console.log(`Creating/updating file: ${filePath}`);
              this.onFileContent(
                filePath,
                fileContent,
                this.projectId,
                this.promptId,
              );
              this.processedActions.add(actionId);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error parsing artifact:", error);
    }
  }

  reset() {
    this.processedActions.clear();
    this.currentArtifact = "";
    console.log("---------------Completed----------------");
  }
}
