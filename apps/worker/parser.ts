export class ArtifactProcessor {
  public currentArtifact: string;
  private onFileContent: (filePath: string, fileContent: string) => void;
  private onShellCommand: (shellCommand: string) => void;
  private processedActions: Set<string> = new Set();

  constructor(
    currentArtifact: string,
    onFileContent: (filePath: string, fileContent: string) => void,
    onShellCommand: (shellCommand: string) => void,
  ) {
    this.currentArtifact = currentArtifact;
    this.onFileContent = onFileContent;
    this.onShellCommand = onShellCommand;
  }

  append(artifact: string) {
    this.currentArtifact += artifact;
  }

  parse() {
    try {
      // Extract content from markdown code blocks if present
      let content = this.currentArtifact;

      // Check if content is wrapped in markdown code blocks
      const codeBlockMatch = content.match(
        /```(?:xml|html)?\s*([\s\S]*?)\s*```/,
      );
      if (codeBlockMatch) {
        content = codeBlockMatch[1];
      }

      // Extract boltArtifact content
      const artifactMatch = content.match(
        /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/,
      );
      if (!artifactMatch) {
        return;
      }

      const artifactContent = artifactMatch[1];

      // Find all boltActions
      const actionRegex = /<boltAction\s+([^>]*?)>([\s\S]*?)<\/boltAction>/g;
      let match;

      while ((match = actionRegex.exec(artifactContent)) !== null) {
        const attributes = match[1];
        const actionContent = match[2];

        // Create a unique identifier for this action
        const actionId = `${attributes}-${actionContent.substring(0, 50)}`;

        // Skip if already processed
        if (this.processedActions.has(actionId)) {
          continue;
        }

        // Parse attributes
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
            this.onShellCommand(shellCommand);
            this.processedActions.add(actionId);
          }
        } else if (actionType === "file") {
          if (filePathMatch) {
            const filePath = filePathMatch[1];
            const fileContent = actionContent.trim();

            if (filePath && fileContent) {
              console.log(`Creating/updating file: ${filePath}`);
              this.onFileContent(filePath, fileContent);
              this.processedActions.add(actionId);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error parsing artifact:", error);
    }
  }

  // Method to reset processed actions if needed
  reset() {
    this.processedActions.clear();
    this.currentArtifact = "";
  }
}
