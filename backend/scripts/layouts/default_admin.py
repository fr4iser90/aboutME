default_admin_layout = {
    "name": "admin_default_grid",
    "description": "4-Spalten-Admin-Grid mit Sidebar, Contextbar, Main, Copilotbar",
    "grid": {
        "columns": [
            {"area": "sidebar", "width": "64px", "visible": True, "order": 1},
            {"area": "contextbar", "width": "288px", "visible": True, "order": 2},
            {"area": "main", "width": "1fr", "visible": True, "order": 3},
            {"area": "copilotbar", "width": "320px", "visible": True, "order": 4}
        ],
        "rows": [
            {"height": "100vh"}
        ],
        "areas": [
            ["sidebar", "contextbar", "main", "copilotbar"]
        ]
    }
}
