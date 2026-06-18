package handlers

import (
	"strings"
)

func formatNetworkError(err error) string {
	if err == nil {
		return "Unknown network error."
	}

	errStr := err.Error()

	// Check for timeout
	if strings.Contains(errStr, "timeout") || strings.Contains(errStr, "deadline exceeded") {
		return "Request timed out. The server took too long to respond. Please try again."
	}

	// Check for connection refused
	if strings.Contains(errStr, "connection refused") {
		return "Failed to connect to the Lit API. Please check your internet connection or try again later."
	}

	// Check for DNS resolution error
	if strings.Contains(errStr, "no such host") {
		return "Unable to resolve server address. Please check your internet connection."
	}

	return "Network error: " + errStr
}
