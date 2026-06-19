package handlers

import (
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
)

// setCmd represents the set command
var setCmd = &cobra.Command{
	Use:   "set [KEY=VALUE] or [KEY] [VALUE]",
	Short: "Set or update an environment variable locally",
	Long: `Set or update an environment variable locally in the .env file.
If the variable already exists, its value will be updated.
If it does not exist, it will be added.
You can optionally automatically push the changes to the remote project using the --push flag.`,
	Run: func(cmd *cobra.Command, args []string) {
		var key, value string

		if len(args) == 0 {
			cmd.Println("❌ Please specify a variable to set. Example: lit set KEY=VALUE or lit set KEY VALUE")
			return
		}

		if len(args) == 1 {
			// Format is KEY=VALUE
			parts := strings.SplitN(args[0], "=", 2)
			if len(parts) != 2 {
				cmd.Println("❌ Invalid argument format. Expected KEY=VALUE or two arguments (KEY VALUE)")
				return
			}
			key = strings.TrimSpace(parts[0])
			value = strings.TrimSpace(parts[1])
		} else if len(args) >= 2 {
			// Format is KEY VALUE
			key = strings.TrimSpace(args[0])
			value = strings.TrimSpace(args[1])
		}

		if key == "" {
			cmd.Println("❌ Key cannot be empty")
			return
		}

		// uppercase the key to follow env standards
		key = strings.ToUpper(key)

		filePath, _ := cmd.Flags().GetString("file")
		if filePath == "" {
			filePath = ".env"
		}

		// Read the file if it exists
		var content []byte
		var err error
		if _, err = os.Stat(filePath); err == nil {
			content, err = os.ReadFile(filePath)
			if err != nil {
				cmd.Printf("❌ Failed to read %s: %v\n", filePath, err)
				return
			}
		}

		lines := strings.Split(string(content), "\n")
		found := false
		newLines := make([]string, 0, len(lines))

		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if trimmed == "" || strings.HasPrefix(trimmed, "#") {
				newLines = append(newLines, line)
				continue
			}

			eqIdx := strings.Index(line, "=")
			if eqIdx > 0 {
				lineKey := strings.TrimSpace(line[:eqIdx])
				if strings.ToUpper(lineKey) == key {
					// Update value
					newLines = append(newLines, fmt.Sprintf("%s=%s", lineKey, value))
					found = true
					continue
				}
			}
			newLines = append(newLines, line)
		}

		if !found {
			// Ensure there's a newline at the end if file was not empty and didn't end with newline
			if len(newLines) > 0 && newLines[len(newLines)-1] != "" {
				newLines = append(newLines, "")
			}
			newLines = append(newLines, fmt.Sprintf("%s=%s", key, value))
		}

		// Join and write back
		output := strings.Join(newLines, "\n")
		// Ensure single trailing newline
		if !strings.HasSuffix(output, "\n") {
			output += "\n"
		}

		err = os.WriteFile(filePath, []byte(output), 0644)
		if err != nil {
			cmd.Printf("❌ Failed to write to %s: %v\n", filePath, err)
			return
		}

		fmt.Printf("✅ Successfully set %s in %s\n", key, filePath)

		// Check if we should push
		shouldPush, _ := cmd.Flags().GetBool("push")
		if shouldPush {
			fmt.Println("🚀 Automatically pushing updates to remote project...")
			PushEnvFile(filePath)
		}
	},
}

func init() {
	setCmd.Flags().StringP("file", "f", ".env", "Path to the .env file")
	setCmd.Flags().BoolP("push", "p", false, "Automatically push the updated variables to the remote server")
	rootCmd.AddCommand(setCmd)
}
