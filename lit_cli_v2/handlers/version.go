package handlers

import (
	"fmt"

	"github.com/spf13/cobra"
)

// Version represents the CLI release version, can be set via ldflags
var Version = "v0.3.3"

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the CLI version information",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("Lit Envs CLI %s\n", Version)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
	rootCmd.Version = Version
	rootCmd.SetVersionTemplate("Lit Envs CLI {{.Version}}\n")
}
