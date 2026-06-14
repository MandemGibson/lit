import os
import click
from halo import Halo


@click.command("init")
def init():
    spinner = Halo(text="Initializing...", spinner="dots")
    spinner.start()

    try:
        gitignore_path = ".gitignore"
        marker = "# Added by Lit Env(Don't remove these files)"
        lit_env_line = ".lit_env_data.toml"
        lit_bin = "lit"

        # Create the file if it doesn't exist
        if not os.path.exists(gitignore_path):
            with open(gitignore_path, "w") as f:
                pass  # create empty file

        # Read existing contents
        with open(gitignore_path, "r") as f:
            existing = f.read()

        # Only write if not already present
        if marker not in existing and lit_env_line not in existing:
            new_lines = f"\n{marker}\n{lit_env_line}\n{lit_bin}\n"
            with open(gitignore_path, "a") as f:
                f.write(new_lines)

        spinner.succeed("Initialization complete. Lit Env Initiated.")
    except Exception as e:
        spinner.fail(f"Error: {e}")
