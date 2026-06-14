import click
import requests
import yaml
import toml
from pathlib import Path
from halo import Halo

# CONFIG_PATH = Path("./main/config.yaml")
DATA_PATH = Path(".lit_env_data.toml")


# def load_config():
#     if CONFIG_PATH.exists():
#         with open(CONFIG_PATH, "r") as f:
#             return yaml.safe_load(f)
#     return {}
#


def save_active_project(project_name, id):
    data = {}
    if DATA_PATH.exists():
        data = toml.load(DATA_PATH)
    else:
        data = {}

    data["active_project"] = {
        "project_name": project_name,
        "id": id,
    }
    with open(DATA_PATH, "w") as f:
        toml.dump(data, f)


def load_token():
    if DATA_PATH.exists():
        with open(DATA_PATH, "r") as f:
            data = toml.load(f)
            return data.get("auths", {}).get("token")
    return None


def save_data_to_config(data):
    with open(DATA_PATH, "w") as f:
        toml.dump(data, f)


@click.command()
def select_project():
    """Fetch user projects and select one."""
    # config = load_config()
    token = load_token()
    API_URL = "http://localhost:8080"

    if not token:
        click.secho("🔑 Token not found. Please login first.", fg="red")
        return

    spinner = Halo(text="Fetching projects...", spinner="dots")
    spinner.start()

    try:
        response = requests.get(
            f"{API_URL}/projects/active-projects",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        spinner.stop()

        if response.status_code != 200:
            click.secho(
                f"❌ Failed to fetch projects: {response.status_code}", fg="red"
            )
            click.secho(response.text, fg="red")
            return

        projects = response.json()["data"]
        if not projects:
            click.secho("⚠️ No projects found.", fg="yellow")
            return

        click.secho("\n📁 Available Projects:\n", fg="cyan", bold=True)
        for idx, proj in enumerate(projects, 1):
            click.echo(f"{idx}. {proj['projectName']} (ID: {proj['id']})")

        choice = click.prompt(
            "\nSelect a project", type=click.IntRange(1, len(projects))
        )
        selected = projects[choice - 1]

        save_active_project(selected["projectName"], selected["id"])

        click.secho(
            f"\n✅ Project selected: {selected['projectName']} (ID: {selected['id']})",
            fg="green",
        )

    except requests.RequestException as e:
        spinner.fail("🚨 Network error.")
        click.secho(str(e), fg="red")
