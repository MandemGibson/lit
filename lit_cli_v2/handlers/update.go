package handlers

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/briandowns/spinner"
	"github.com/spf13/cobra"
)

type GHRelease struct {
	TagName string `json:"tag_name"`
}

var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "Check and update the Lit CLI to the latest version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("🔄 Checking for updates...")

		s := spinner.New(spinner.CharSets[9], 100*time.Millisecond)
		s.Suffix = " Querying GitHub Releases..."
		s.Start()

		client := http.Client{Timeout: 15 * time.Second}
		resp, err := client.Get("https://api.github.com/repos/MandemGibson/lit/releases/latest")
		if err != nil {
			s.FinalMSG = fmt.Sprintf("❌ Failed to query GitHub: %v\n", err)
			s.Stop()
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			s.FinalMSG = fmt.Sprintf("❌ GitHub returned status: %s\n", resp.Status)
			s.Stop()
			return
		}

		var release GHRelease
		if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
			s.FinalMSG = "❌ Failed to parse release data\n"
			s.Stop()
			return
		}
		s.Stop()

		fmt.Printf("Current version: %s\n", Version)
		fmt.Printf("Latest version:  %s\n", release.TagName)

		if release.TagName == Version {
			fmt.Println("✅ You are already running the latest version!")
			return
		}

		fmt.Println("🚀 New update available. Installing...")

		s = spinner.New(spinner.CharSets[9], 100*time.Millisecond)
		s.Suffix = " Downloading release package..."
		s.Start()

		// Determine binary names and format
		var osName string
		switch runtime.GOOS {
		case "darwin":
			osName = "darwin"
		case "linux":
			osName = "linux"
		case "windows":
			osName = "windows"
		default:
			s.FinalMSG = fmt.Sprintf("❌ Unsupported operating system: %s\n", runtime.GOOS)
			s.Stop()
			return
		}

		var archName string
		switch runtime.GOARCH {
		case "amd64":
			archName = "amd64"
		case "arm64":
			archName = "arm64"
		default:
			s.FinalMSG = fmt.Sprintf("❌ Unsupported architecture: %s\n", runtime.GOARCH)
			s.Stop()
			return
		}

		var archiveExt string
		if runtime.GOOS == "windows" {
			archiveExt = "zip"
		} else {
			archiveExt = "tar.gz"
		}

		archiveName := fmt.Sprintf("lit-%s-%s.%s", osName, archName, archiveExt)
		downloadURL := fmt.Sprintf("https://github.com/MandemGibson/lit/releases/latest/download/%s", archiveName)

		pkgResp, err := client.Get(downloadURL)
		if err != nil {
			s.FinalMSG = fmt.Sprintf("❌ Failed to download package: %v\n", err)
			s.Stop()
			return
		}
		defer pkgResp.Body.Close()

		if pkgResp.StatusCode != http.StatusOK {
			s.FinalMSG = fmt.Sprintf("❌ Release download failed with status: %s\n", pkgResp.Status)
			s.Stop()
			return
		}

		// Get current executable path
		exePath, err := os.Executable()
		if err != nil {
			s.FinalMSG = fmt.Sprintf("❌ Failed to resolve executable path: %v\n", err)
			s.Stop()
			return
		}

		exeDir := filepath.Dir(exePath)
		tempNewExePath := filepath.Join(exeDir, fmt.Sprintf(".lit-update-%d.tmp", time.Now().Unix()))

		s.Suffix = " Extracting update package..."

		if runtime.GOOS == "windows" {
			// Windows: ZIP extraction
			tempZipFile, err := os.CreateTemp("", "lit-update-*.zip")
			if err != nil {
				s.FinalMSG = fmt.Sprintf("❌ Failed to create temp zip: %v\n", err)
				s.Stop()
				return
			}
			defer os.Remove(tempZipFile.Name())
			defer tempZipFile.Close()

			if _, err := io.Copy(tempZipFile, pkgResp.Body); err != nil {
				s.FinalMSG = fmt.Sprintf("❌ Failed to save downloaded zip: %v\n", err)
				s.Stop()
				return
			}

			zipReader, err := zip.OpenReader(tempZipFile.Name())
			if err != nil {
				s.FinalMSG = fmt.Sprintf("❌ Failed to open zip archive: %v\n", err)
				s.Stop()
				return
			}
			defer zipReader.Close()

			var extracted bool
			for _, file := range zipReader.File {
				if filepath.Ext(file.Name) == ".exe" {
					rc, err := file.Open()
					if err != nil {
						s.FinalMSG = fmt.Sprintf("❌ Failed to read file inside zip: %v\n", err)
						s.Stop()
						return
					}
					defer rc.Close()

					out, err := os.OpenFile(tempNewExePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0755)
					if err != nil {
						s.FinalMSG = fmt.Sprintf("❌ Failed to create new executable: %v\n", err)
						s.Stop()
						return
					}
					defer out.Close()

					if _, err := io.Copy(out, rc); err != nil {
						s.FinalMSG = fmt.Sprintf("❌ Failed to write new executable: %v\n", err)
						s.Stop()
						return
					}
					extracted = true
					break
				}
			}
			if !extracted {
				s.FinalMSG = "❌ Failed to locate executable inside zip archive\n"
				s.Stop()
				return
			}
		} else {
			// Unix: tar.gz extraction
			gzipReader, err := gzip.NewReader(pkgResp.Body)
			if err != nil {
				s.FinalMSG = fmt.Sprintf("❌ Failed to initialize gzip reader: %v\n", err)
				s.Stop()
				return
			}
			defer gzipReader.Close()

			tarReader := tar.NewReader(gzipReader)
			var extracted bool

			for {
				header, err := tarReader.Next()
				if err == io.EOF {
					break
				}
				if err != nil {
					s.FinalMSG = fmt.Sprintf("❌ Failed to read tar archive: %v\n", err)
					s.Stop()
					return
				}

				if header.Typeflag == tar.TypeReg {
					out, err := os.OpenFile(tempNewExePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0755)
					if err != nil {
						s.FinalMSG = fmt.Sprintf("❌ Failed to create new executable: %v\n", err)
						s.Stop()
						return
					}
					defer out.Close()

					if _, err := io.Copy(out, tarReader); err != nil {
						s.FinalMSG = fmt.Sprintf("❌ Failed to extract executable: %v\n", err)
						s.Stop()
						return
					}
					extracted = true
					break
				}
			}
			if !extracted {
				s.FinalMSG = "❌ Failed to locate executable inside tar archive\n"
				s.Stop()
				return
			}
		}

		s.Suffix = " Replacing current executable..."

		// Safe replacement logic
		if runtime.GOOS == "windows" {
			// Windows: rename current, rename new to current, schedule old for deletion
			oldExePath := exePath + ".old"
			_ = os.Remove(oldExePath) // remove if existing
			if err := os.Rename(exePath, oldExePath); err != nil {
				s.FinalMSG = fmt.Sprintf("❌ Failed to rename current executable: %v\n", err)
				s.Stop()
				os.Remove(tempNewExePath)
				return
			}
			if err := os.Rename(tempNewExePath, exePath); err != nil {
				s.FinalMSG = fmt.Sprintf("❌ Failed to install new executable: %v\n", err)
				s.Stop()
				_ = os.Rename(oldExePath, exePath) // rollback
				return
			}
			// We leave oldExePath. Windows deletes it next time or user cleans up.
		} else {
			// Unix: simple rename replaces the link/binary seamlessly
			if err := os.Rename(tempNewExePath, exePath); err != nil {
				s.FinalMSG = fmt.Sprintf("❌ Failed to swap executables: %v\n", err)
				s.Stop()
				os.Remove(tempNewExePath)
				return
			}
		}

		s.FinalMSG = "✅ CLI updated successfully!\n"
		s.Stop()
		fmt.Printf("🎉 Run 'lit version' to confirm version.\n")
	},
}

func init() {
	rootCmd.AddCommand(updateCmd)
}
