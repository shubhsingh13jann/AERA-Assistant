"""Opening desktop applications."""

import os
import subprocess

from config import APPS


def open_app(name: str) -> str:
    path = APPS.get(name)
    if path and os.path.exists(path):
        subprocess.Popen(path)
        return f"command accepted - opening {name}."
    return f"I don't have a saved path for {name}. Update config.APPS."
