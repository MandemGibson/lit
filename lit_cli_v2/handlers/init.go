package handlers

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/briandowns/spinner"
	"github.com/spf13/cobra"
)

var initCommand = &cobra.Command{
	Use:   "init",
	Short: "Initialize a lit project",
	Run: func(cmd *cobra.Command, args []string) {
		s := spinner.New(spinner.CharSets[9], 100*time.Millisecond)
		fmt.Println(">>>")
		s.Suffix = "Initializing..."
		s.Start()
		gitIgnorePath := ".gitignore"
		marker := "# Added by Lit Env(Don't remove these files)"
		litEnvLine := ".lit_env_data.toml"
		litBin := "lit"

		if _, err := os.Stat(gitIgnorePath); os.IsNotExist(err) {
			f, err := os.Create(gitIgnorePath)
			if err != nil {
				s.FinalMSG = fmt.Sprintf("Error creating .gitignore file: %v\n", err)
				s.Stop()
				os.Exit(1)
			}
			f.Close()
		}

		contentBytes, err := os.ReadFile(gitIgnorePath)
		if err != nil {
			s.FinalMSG = fmt.Sprintf("Error reading content of .gitignore %v\n", err)
			s.Stop()
			os.Exit(1)
		}
		content := string(contentBytes)
		if !strings.Contains(content, marker) && !strings.Contains(content, litEnvLine) {
			newLines := fmt.Sprintf("\n%s\n%s\n%s\n", marker, litEnvLine, litBin)

			f, err := os.OpenFile(gitIgnorePath, os.O_APPEND|os.O_WRONLY, 0644)
			if err != nil {
				s.FinalMSG = fmt.Sprintf("Error writing to .gitignore: %v\n", err)
				s.Stop()
				os.Exit(1)
			}
			defer f.Close()
			if _, err := f.WriteString(newLines); err != nil {
				s.FinalMSG = fmt.Sprintf("Error appending to .gitignore: %v\n", err)
				s.Stop()
				os.Exit(1)
			}
		}
		s.FinalMSG = "✔ Initialization complete. Lit Env Initiated.\n"
		s.Stop()
	},
}

func init() {
	rootCmd.AddCommand(initCommand)
}
