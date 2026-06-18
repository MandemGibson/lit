package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/briandowns/spinner"
	"github.com/spf13/cobra"
)


var PullCmd = &cobra.Command{
	Use:   "pull",
	Short: "Pull environment variables from the server",
	Run: func(cmd *cobra.Command, args []string) {
		pullEnv()
	},
}


// func findBetween(s, start, end string) string {
// 	startIdx := len(start) + len(s[:len(s)-len(start)]) - len(s)
// 	if idx := len(s[:len(s)-len(end)]); idx >= startIdx {
// 		return s[startIdx:idx]
// 	}
// 	return ""
// }

func pullEnv() {
	API_URL := apiBackend
	token := LoadToken()
  projectID := LoadActiveProjectID()

	if token == "" || projectID == "" {
		fmt.Println("❌ Missing token or project ID.")
		return
	}

	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = " Fetching project .env data..."
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
		s.FinalMSG = fmt.Sprintf("❌ Failed to fetch project: %s\n", res.Status)
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
		os.Exit(1)
	}

	s.Stop()

	if result.Data == "" {
		fmt.Println("⚠️ No environment data found for this project.")
		return
	}

	os.WriteFile(".env", []byte(result.Data), 0644)
	fmt.Println("✅ Environment variables written to .env")
}


func init() {
	rootCmd.AddCommand(PullCmd)
}
