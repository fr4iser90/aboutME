default_me_layout = {
    "name": "me_default_grid",
    "description": "Grid-Layout für die Hauptseite mit Navbar, Main, optional Sidebar und Footer.",
    "grid": {
        "columns": [
            {"area": "navbar", "width": "1fr", "visible": True, "order": 1},
            {"area": "sidebar", "width": "300px", "visible": False, "order": 2},
            {"area": "main", "width": "1fr", "visible": True, "order": 3},
            {"area": "footer", "width": "1fr", "visible": False, "order": 4}
        ],
        "rows": [
            {"height": "64px"},   # Navbar
            {"height": "auto"},   # Main/Sidebar
            {"height": "64px"}    # Footer
        ],
        "areas": [
            ["navbar", "navbar", "navbar", "navbar"],
            ["main", "main", "sidebar", "sidebar"],
            ["footer", "footer", "footer", "footer"]
        ]
    }
}
