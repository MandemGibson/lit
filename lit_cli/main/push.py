import click
import yaml
import requests
import toml
from pathlib import Path
from halo import Halo

CONFIG_PATH = Path("./main/config.yaml")
TOKEN_PATH = Path(".lit_env_data.toml")


# def load_config():
#     if CONFIG_PATH.exists():
#         with open(CONFIG_PATH, "r") as f:
#             return yaml.safe_load(f)
#     return {}
#


def load_data():
    if TOKEN_PATH:
        return toml.load(TOKEN_PATH)
    return None


def load_token():
    if TOKEN_PATH.exists():
        token = toml.load(TOKEN_PATH).get("auths", {}).get("token")
        return token
    return None


@click.command()
@click.option(
    "--file",
    "-f",
    type=click.Path(exists=True),
    help="File to push",
)
def push(file):
    token = load_token()
    API_URL = "http://localhost:8080"

    if not token:
        click.secho("🔑 Token not found. Please login first.", fg="red")
        return

    if not API_URL:
        click.secho("🌐 API URL not found in config.yaml.", fg="red")
        return

    file_path = Path(file)
    content = file_path.read_text()

    active_project = load_data().get("active_project", {})
    spinner = Halo(text="📤 Pushing data...", spinner="dots")
    spinner.start()

    try:
        response = requests.put(
            f"{API_URL}/projects/update-env-data/{active_project.get('id')}/",
            json={"envData": content},
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )

        if response.status_code == 200:
            spinner.succeed("✅ Push successful!")
        else:
            spinner.fail(f"❌ Push failed ({response.status_code})")
            click.secho(response.text, fg="red")

    except requests.RequestException as e:
        spinner.fail("🚨 Network error.")
        click.secho(str(e), fg="red")
