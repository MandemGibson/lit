package handlers

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/briandowns/spinner"
	"github.com/spf13/cobra"
)

var DiffCmd = &cobra.Command{
	Use:   "diff",
	Short: "Compare local .env file with remote project environment variables",
	Run: func(cmd *cobra.Command, args []string) {
		compareEnv()
	},
}

func parseEnvContent(content string) map[string]string {
	envMap := make(map[string]string)
	scanner := bufio.NewScanner(strings.NewReader(content))

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Skip comments and empty lines
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Support 'export KEY=VALUE'
		if strings.HasPrefix(line, "export ") {
			line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])

			// Strip surrounding quotes if any
			if (strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"")) ||
				(strings.HasPrefix(val, "'") && strings.HasSuffix(val, "'")) {
				val = val[1 : len(val)-1]
			}
			envMap[key] = val
		}
	}
	return envMap
}

func compareEnv() {
	API_URL := apiBackend
	token := LoadToken()
	projectID := LoadActiveProjectID()

	if token == "" || projectID == "" {
		fmt.Println("❌ Missing authentication token or active project ID. Run 'lit login' and 'lit select'.")
		return
	}

	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = " Fetching remote project .env data..."
	s.Start()

	url := fmt.Sprintf("%s/projects/pull-env-data/%s", API_URL, projectID)
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		s.FinalMSG = fmt.Sprintf("🚨 %s\n", formatNetworkError(err))
		s.Stop()
		return
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		body, _ := io.ReadAll(res.Body)
		s.FinalMSG = fmt.Sprintf("❌ Failed to fetch remote project: %s\n", res.Status)
		s.Stop()
		fmt.Println(string(body))
		return
	}

	var result struct {
		Data string `json:"data"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		s.FinalMSG = "❌ Failed to parse server response\n"
		s.Stop()
		return
	}
	s.Stop()

	// Parse remote env map
	remoteMap := parseEnvContent(result.Data)

	// Read local .env file
	localBytes, err := os.ReadFile(".env")
	if err != nil {
		fmt.Println("⚠️ Local .env file not found in current directory.")
		fmt.Println("Showing Remote Keys:")
		for k, v := range remoteMap {
			fmt.Printf("  🔴 - %s=%s\n", k, v)
		}
		return
	}
	localMap := parseEnvContent(string(localBytes))

	// Collect all keys
	allKeys := make(map[string]bool)
	for k := range remoteMap {
		allKeys[k] = true
	}
	for k := range localMap {
		allKeys[k] = true
	}

	fmt.Println("\n📊 Environment Diff (Local vs Remote):")
	fmt.Println("-------------------------------------------")

	additions := 0
	removals := 0
	modifications := 0
	identical := 0

	for k := range allKeys {
		localVal, inLocal := localMap[k]
		remoteVal, inRemote := remoteMap[k]

		if inLocal && !inRemote {
			fmt.Printf("🟢 + %s=%s (Local only - missing in Remote)\n", k, localVal)
			additions++
		} else if !inLocal && inRemote {
			fmt.Printf("🔴 - %s=%s (Remote only - missing in Local)\n", k, remoteVal)
			removals++
		} else if localVal != remoteVal {
			fmt.Printf("🟡 ~ %s (Local: \"%s\" | Remote: \"%s\")\n", k, localVal, remoteVal)
			modifications++
		} else {
			identical++
		}
	}

	fmt.Println("-------------------------------------------")
	fmt.Printf("Summary: %d additions, %d removals, %d modifications, %d identical keys.\n",
		additions, removals, modifications, identical)
}

func init() {
	rootCmd.AddCommand(DiffCmd)
}
