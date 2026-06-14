package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/briandowns/spinner"
	"github.com/pelletier/go-toml"
	"github.com/spf13/cobra"
)

type Project struct {
	ID          string `json:"id"`
	ProjectName string `json:"projectName"`
}

type ProjectResponse struct {
	Data []Project `json:"data"`
}

const (
	dataPath = ".lit_env_data.toml"
)

//	func loadToken() string {
//		file, err := os.Open(dataPath)
//		if err != nil {
//			return ""
//		}
//		defer file.Close()
//
//		var config map[string]map[string]string
//		err = toml.NewDecoder(file).Decode(&config)
//		if err != nil {
//			return ""
//		}
//		return config["auths"]["token"]
//	}
func saveActiveProject(name, id string) error {
	var config map[string]interface{}

	if _, err := os.Stat(dataPath); err == nil {
		file, _ := os.Open(dataPath)
		_ = toml.NewDecoder(file).Decode(&config)
		file.Close()
	} else {
		config = map[string]interface{}{}
	}

	config["active_project"] = map[string]string{
		"project_name": name,
		"id":           id,
	}

	file, err := os.Create(dataPath)
	if err != nil {
		return err
	}
	defer file.Close()

	return toml.NewEncoder(file).Encode(config)
}

func SelectProject() {
	token := LoadToken()
	if token == "" {
		fmt.Println("🔑 Token not found. Please login first.")
		return
	}

	s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
	s.Suffix = " Fetching projects..."
	s.Start()

	req, _ := http.NewRequest("GET", apiBackend + "/projects/active-projects", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := http.Client{Timeout: 30 * time.Second}
	res, err := client.Do(req)
	s.Stop()

	if err != nil {
		fmt.Println("🚨 Network error:", err)
		return
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		fmt.Printf("❌ Failed to fetch projects: %d\n", res.StatusCode)
		return
	}

	var parsed ProjectResponse
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		fmt.Println("❌ Failed to parse response:", err)
		return
	}

	if len(parsed.Data) == 0 {
		fmt.Println("⚠️ No projects found.")
		return
	}

	fmt.Println("\n📁 Available Projects:")
	for i, p := range parsed.Data {
		fmt.Printf("%d. %s (ID: %s)\n", i+1, p.ProjectName, p.ID)
	}

	var choice int
	fmt.Print("\nSelect a project: ")
	fmt.Scanln(&choice)

	if choice < 1 || choice > len(parsed.Data) {
		fmt.Println("❌ Invalid selection.")
		return
	}

	selected := parsed.Data[choice-1]
	_ = saveActiveProject(selected.ProjectName, selected.ID)

	fmt.Printf("\n✅ Project selected: %s (ID: %s)\n", selected.ProjectName, selected.ID)
}

var selectCmd = &cobra.Command{
	Use:   "select",
	Short: "Select an active project",
	Run: func(cmd *cobra.Command, args []string) {
		SelectProject()
	},
}

func init() {
	rootCmd.AddCommand(selectCmd)
}
