package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/briandowns/spinner"
	"github.com/pelletier/go-toml"
	"github.com/spf13/cobra"
)

const pushAPIURL = "https://lit-backend-479881079038.europe-west1.run.app"
const dataFilePath = ".lit_env_data.toml"

type Auths struct {
	Email string `toml:"email"`
	Token string `toml:"token"`
}

type ActiveProject struct {
	ID          string `toml:"id"`
	ProjectName string `toml:"project_name"`
}

type Config struct {
	Auths         Auths         `toml:"auths"`
	ActiveProject ActiveProject `toml:"active_project"`
}

// LoadToken reads and returns the saved auth token from .lit_env_data.toml
func LoadToken() string {
	config, err := loadConfig()
	if err != nil {
		return ""
	}
	return config.Auths.Token
}

// LoadProjectID returns the active project ID from .lit_env_data.toml
func LoadActiveProjectID() string {
	config, err := loadConfig()
	if err != nil {
		return ""
	}
	return config.ActiveProject.ID
}

// loadConfig decodes the TOML file into a Config struct
func loadConfig() (*Config, error) {
	data, err := os.ReadFile(dataFilePath)
	if err != nil {
		return nil, err
	}
	var config Config
	err = toml.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}


func PushEnvFile(filePath string) {
	token := LoadToken()
	if token == "" {
		fmt.Println("🔑 Token not found. Please login first.")
		return
	}

	projectID := LoadActiveProjectID()
	if projectID == "" {
		fmt.Println("📁 Active project not found. Please select a project first.")
		return
	}

	content, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Println("❌ Failed to read file:", err)
		return
	}

	payload := map[string]string{"envData": string(content)}
	jsonBody, _ := json.Marshal(payload)

	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = " 📤 Pushing data..."
	s.Start()

	req, _ := http.NewRequest("PUT", fmt.Sprintf("%s/projects/update-env-data/%s/", pushAPIURL, projectID), bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	s.Stop()

	if err != nil {
		fmt.Println("🚨 Network error:", err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode == 200 {
		fmt.Println("✅ Push successful!")
	} else {
		fmt.Printf("❌ Push failed (%d)\n", res.StatusCode)
		body, _ := io.ReadAll(res.Body)
		fmt.Println(string(body))
	}
}

var pushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push .env file to remote project",
	Run: func(cmd *cobra.Command, args []string) {
		filePath, _ := cmd.Flags().GetString("file")
		if filePath == "" {
			cmd.Println("❗ Please specify a file using --file or -f")
			return
		}
		PushEnvFile(filePath)
	},
}

func init() {
	pushCmd.Flags().StringP("file", "f", "", "Path to the .env file to push")
	rootCmd.AddCommand(pushCmd)
}
