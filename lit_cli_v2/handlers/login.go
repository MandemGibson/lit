package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/briandowns/spinner"
	"github.com/manifoldco/promptui"
	"github.com/pelletier/go-toml"
	"github.com/spf13/cobra"
)

const (
	// apiBackend = "http://localhost:8080"
	apiBackend = "https://lit-backend-479881079038.europe-west1.run.app"
	apiURL     = apiBackend + "/auths/obtain-token"
	timeout    = 40 * time.Second
	configFile = ".lit_env_data.toml"
)

func saveAuth(email string, token string) error {
	data := map[string]interface{}{
		"auths": map[string]string{
			"email": email,
			"token": token,
		},
	}
	file, err := os.Create(configFile)
	if err != nil {
		return err
	}
	defer file.Close()
	return toml.NewEncoder(file).Encode(data)
}

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Allow you to authenticate with your Lit Account",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("🔐 Login Process Initiated")
		promptEmail := promptui.Prompt{
			Label: "📧 Enter your email",
		}

		email, err := promptEmail.Run()
		if err != nil {
			fmt.Println("Prompt failed:", err)
			os.Exit(1)
		}

		promptPassword := promptui.Prompt{
			Label: "🔑 Enter your password",
			Mask:  '*',
		}
		password, err := promptPassword.Run()
		if err != nil {
			fmt.Println("Prompt failed:", err)
			os.Exit(1)
		}

		s := spinner.New(spinner.CharSets[9], 100*time.Millisecond)
		s.Suffix = " Authenticating..."
		s.Start()

		client := http.Client{Timeout: timeout}
		payload := map[string]string{
			"email":    email,
			"password": password,
		}

		body, _ := json.Marshal(payload)
		res, err := client.Post(apiURL, "application/json", bytes.NewBuffer(body))
		if err != nil {
			s.FinalMSG = fmt.Sprintf("❌ Request error: %v\n", err)
			s.Stop()
			os.Exit(1)
		}
		defer res.Body.Close()

		if res.StatusCode == 200 {
			var result struct {
				Data struct {
					Token string `json:"token"`
					Email string `json:"email"`
				} `json:"data"`
			}
			err := json.NewDecoder(res.Body).Decode(&result)
			if err != nil {
				s.FinalMSG = "❌ Failed to parse server response\n"
				s.Stop()
				os.Exit(1)
			}

			if result.Data.Token != "" {
				saveErr := saveAuth(result.Data.Email, result.Data.Token)
				if saveErr != nil {
					s.FinalMSG = fmt.Sprintf("❌ Failed to save token: %v\n", saveErr)
					s.Stop()
					os.Exit(1)
				}
				s.FinalMSG = fmt.Sprintf("✅ Login successful as %s!\n", result.Data.Email)
				s.Stop()
				fmt.Println("🔑 Token saved locally")
			} else {
				s.FinalMSG = "❌ Login failed: No token received.\n"
				s.Stop()
			}
		} else {
			s.FinalMSG = "❌ Login failed: Invalid credentials.\n"
			s.Stop()
		}
	},
}

func init() {
	rootCmd.AddCommand(loginCmd)
}
