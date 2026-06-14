import click
import yaml
from halo import Halo
import toml
import time
import requests


# with open("./main/config.yaml", "r") as f:
#     config = yaml.safe_load(f)
#
API_BACKEND = "http://localhost:8080"

API_URL = f"{API_BACKEND}/auths/obtain-token"
TIME_OUT = 40
DATA_OPS_FILE = ".lit_env_data.toml"
LET_CONFIG_PATH = DATA_OPS_FILE


def save_auth(email, token):
    config_data = {"auths": {"email": email, "token": token}}
    with open(LET_CONFIG_PATH, "w") as f:
        toml.dump(config_data, f)


@click.command("login")
def login():

    click.secho("🔐 Login Process Initiated", fg="cyan", bold=True)

    email = click.prompt("📧 Enter your email", type=str)
    password = click.prompt("🔑 Enter your password", hide_input=True)
    spinner = Halo(text="Authenticating...", spinner="dots")
    spinner.start()
    try:
        response = requests.post(
            API_URL,
            json={"email": email, "password": password},
            timeout=TIME_OUT,
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("data")["token"]
            email = data.get("data")["email"]
            if token:
                save_auth(email, token)
                spinner.succeed(f"✅ Login successful as {email}!")
                click.secho("🔑 Token saved locally", fg="green")
            else:
                spinner.fail("❌ Login failed: No token received.")
        else:
            spinner.fail("❌ Login failed: Invalid credentials.")
    except Exception as e:
        print(e)
        raise e
