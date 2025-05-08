import os
import shutil
from glob import glob
from pathlib import Path

home = Path.home()
user = home.name
script_path = Path(__file__).resolve()
project_root = script_path.parent
uuid = "clipboard-history@axaul"
applet_sources_dir = project_root / "files" / uuid
mo_files_dir = project_root / "mo_files"

remote_applet_dir = home / ".local" / "share" / "cinnamon" / "applets" / uuid
remote_locale_base = home / ".local" / "share" / "locale"

# Applet install 
print(f"Creating or replacing the directory : {remote_applet_dir}")
if remote_applet_dir.exists():
    shutil.rmtree(remote_applet_dir)
shutil.copytree(applet_sources_dir, remote_applet_dir)

# Languages install
for mo_path in mo_files_dir.glob("*.mo"):
    lang_code = mo_path.stem
    remote_locale_dir = remote_locale_base / lang_code / "LC_MESSAGES"
    remote_mo_path = remote_locale_dir / f"{uuid}.mo"

    print(f"Installation of the {lang_code} translation")
    remote_locale_dir.mkdir(parents=True,exist_ok=True)
    shutil.copy2(mo_path, remote_mo_path)

print("Done! Please reboot Cinnamon (Alt+F2, 'r' and Enter.)")
