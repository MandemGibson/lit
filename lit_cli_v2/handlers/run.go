package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/briandowns/spinner"
	"github.com/spf13/cobra"
)

var RunCmd = &cobra.Command{
	Use:   "run -- [command]",
	Short: "Run a command with remote project secrets injected directly into process memory",
	Long:  `Injects project environment variables in-memory into the executed command without writing a .env file to disk.`,
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		runWithEnv(args)
	},
}

func runWithEnv(args []string) {
	API_URL := apiBackend
	token := LoadToken()
	projectID := LoadActiveProjectID()

	if token == "" || projectID == "" {
		fmt.Println("❌ Missing authentication token or active project ID. Run 'lit login' and 'lit select'.")
		os.Exit(1)
	}

	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = " Injecting secrets into process memory..."
	s.Start()

	url := fmt.Sprintf("%s/projects/pull-env-data/%s", API_URL, projectID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		s.FinalMSG = fmt.Sprintf("🚨 %s\n", formatNetworkError(err))
		s.Stop()
		os.Exit(1)
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		body, _ := io.ReadAll(res.Body)
		s.FinalMSG = fmt.Sprintf("❌ Failed to fetch project secrets: %s\n", res.Status)
		s.Stop()
		fmt.Println(string(body))
		os.Exit(1)
	}

	var result struct {
		Data string `json:"data"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		s.FinalMSG = "❌ Failed to parse server response\n"
		s.Stop()
		os.Exit(1)
	}
	s.Stop()

	// Parse environment data
	secretMap := parseEnvContent(result.Data)

	// Build environment slice (merge current process env + injected secrets)
	envMap := make(map[string]string)
	for _, env := range os.Environ() {
		parts := splitEnv(env)
		if len(parts) == 2 {
			envMap[parts[0]] = parts[1]
		}
	}
	// Override with Lit project secrets
	for k, v := range secretMap {
		envMap[k] = v
	}

	var envSlice []string
	for k, v := range envMap {
		envSlice = append(envSlice, fmt.Sprintf("%s=%s", k, v))
	}

	// Prepare process execution
	targetCommand := args[0]
	targetArgs := args[1:]

	childCmd := exec.Command(targetCommand, targetArgs...)
	childCmd.Env = envSlice
	childCmd.Stdin = os.Stdin
	childCmd.Stdout = os.Stdout
	childCmd.Stderr = os.Stderr

	if err := childCmd.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		fmt.Printf("❌ Process execution failed: %v\n", err)
		os.Exit(1)
	}
}

func splitEnv(env string) []string {
	for i := 0; i < len(env); i++ {
		if env[i] == '=' {
			return []string{env[:i], env[i+1:]}
		}
	}
	return []string{env}
}

func init() {
	rootCmd.AddCommand(RunCmd)
}
