package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/briandowns/spinner"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var createCmd = &cobra.Command{
	Use:   "create [project-name]",
	Short: "Create a new project and set it as active",
	Long:  `Create a new Lit project on the remote server and automatically set it as the active project for push/pull operations.`,
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		token := LoadToken()
		if token == "" {
			fmt.Println("🔑 Token not found. Please login first.")
			return
		}

		// Get project name from args or prompt
		var projectName string
		if len(args) > 0 {
			projectName = args[0]
		} else {
			prompt := promptui.Prompt{
				Label: "📁 Project name",
			}
			result, err := prompt.Run()
			if err != nil {
				fmt.Println("Prompt cancelled.")
				return
			}
			projectName = result
		}

		if projectName == "" {
			fmt.Println("❌ Project name cannot be empty.")
			return
		}

		// Get optional description
		descPrompt := promptui.Prompt{
			Label:   "📝 Description (optional)",
			Default: "",
		}
		description, _ := descPrompt.Run()

		// Create project via API
		s := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
		s.Suffix = " Creating project..."
		s.Start()

		payload := map[string]string{
			"projectName": projectName,
			"description": description,
		}
		jsonBody, _ := json.Marshal(payload)

		req, _ := http.NewRequest("POST", apiBackend+"/projects/create", bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")

		client := http.Client{Timeout: 30 * time.Second}
		res, err := client.Do(req)
		s.Stop()

		if err != nil {
			fmt.Println("🚨", formatNetworkError(err))
			return
		}
		defer res.Body.Close()

		var result struct {
			StatusCode int    `json:"statusCode"`
			Message    string `json:"message"`
			Data       struct {
				ID          string `json:"id"`
				ProjectName string `json:"projectName"`
			} `json:"data"`
		}

		if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
			fmt.Println("❌ Failed to parse response:", err)
			return
		}

		if result.StatusCode == 201 {
			fmt.Printf("✅ Project \"%s\" created successfully!\n", result.Data.ProjectName)

			// Auto-set as active project
			if err := saveActiveProject(result.Data.ProjectName, result.Data.ID); err != nil {
				fmt.Println("⚠️  Project created but failed to set as active:", err)
				return
			}
			fmt.Printf("📌 Set as active project (ID: %s)\n", result.Data.ID)
			fmt.Println("👉 You can now run: lit push -f .env")
		} else if result.StatusCode == 409 {
			fmt.Printf("⚠️  A project named \"%s\" already exists.\n", projectName)
		} else {
			fmt.Printf("❌ Failed to create project: %s\n", result.Message)
		}
	},
}

func init() {
	rootCmd.AddCommand(createCmd)
}
