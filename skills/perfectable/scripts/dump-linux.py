#!/usr/bin/env python3
"""Dump one application's AT-SPI tree as Perfectable JSON. Exit 3 if AT-SPI is unavailable."""
import json
import sys

pid = int(sys.argv[1])

def emit(node):
    sys.stdout.write(json.dumps(node))
    sys.exit(0)

try:
    import gi
    gi.require_version("Atspi", "2.0")
    from gi.repository import Atspi
except Exception as exc:
    sys.stderr.write(f"atspi-unavailable: {exc}\n")
    sys.exit(3)

Atspi.init()
desktop = Atspi.get_desktop(0)

def find(root, depth=0):
    if root is None or depth > 8:
        return None
    try:
        if root.get_process_id() == pid:
            role = (root.get_role_name() or "").lower()
            if role in ("application", "frame", "window"):
                return root
    except Exception:
        pass
    try:
        count = root.get_child_count()
    except Exception:
        return None
    for i in range(min(count, 60)):
        hit = find(root.get_child(i), depth + 1)
        if hit:
            return hit
    return None

app = None
try:
    n = desktop.get_child_count()
except Exception as exc:
    sys.stderr.write(f"atspi-unavailable: {exc}\n")
    sys.exit(3)
for i in range(n):
    app = find(desktop.get_child(i))
    if app:
        break
if app is None:
    sys.stderr.write("process not in AT-SPI tree\n")
    sys.exit(3)

def dump(el, depth=0):
    if el is None or depth > 5:
        return None
    try:
        role = el.get_role_name() or ""
        name = el.get_name() or ""
        desc = el.get_description() or ""
        count = el.get_child_count() if depth < 4 else 0
    except Exception:
        return None
    children = []
    for i in range(min(count, 40)):
        child = dump(el.get_child(i), depth + 1)
        if child:
            children.append(child)
    return {"role": role, "title": name, "description": desc, "children": children}

emit(dump(app))
