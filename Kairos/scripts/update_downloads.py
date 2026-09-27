"""Refresh the all-time download snapshot without changing it on failure."""

import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


MODEL_IDS = (
    "mldi-lab/Kairos_50m",
    "mldi-lab/Kairos_23m",
    "mldi-lab/Kairos_10m",
)
SNAPSHOT_PATH = (
    Path(__file__).resolve().parents[1] / "static" / "data" / "downloads.json"
)


def fetch_snapshot():
    models = []
    for model_id in MODEL_IDS:
        request = Request(
            f"https://huggingface.co/api/models/{model_id}"
            "?expand%5B%5D=downloadsAllTime",
            headers={"User-Agent": "Kairos-Project-Page/1.0"},
        )
        with urlopen(request, timeout=15) as response:
            data = json.load(response)
        if not isinstance(data, dict):
            raise ValueError(f"Invalid API response for {model_id}")
        count = data.get("downloadsAllTime")
        if type(count) is not int or count < 0:
            raise ValueError(f"Missing or invalid all-time count for {model_id}")
        if data.get("id", model_id) != model_id:
            raise ValueError(f"Unexpected model identity for {model_id}")
        models.append({"id": model_id, "downloads": count})
    return {
        "metric": "downloadsAllTime",
        "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "models": models,
    }


def main():
    try:
        snapshot = fetch_snapshot()
        with tempfile.TemporaryDirectory(
            dir=SNAPSHOT_PATH.parent, prefix=".downloads-"
        ) as directory:
            temporary_path = Path(directory) / "downloads.json"
            temporary_path.write_text(
                json.dumps(snapshot, indent=2) + "\n", encoding="utf-8"
            )
            os.replace(temporary_path, SNAPSHOT_PATH)
    except (OSError, URLError, ValueError) as error:
        print(f"Snapshot unchanged: {error}", file=sys.stderr)
        return 1
    total = sum(model["downloads"] for model in snapshot["models"])
    print(f"Updated {SNAPSHOT_PATH}: {total:,} all-time downloads")
    return 0


if __name__ == "__main__":
    sys.exit(main())
