from app.crud.base import CRUDBase
from app.models.theme import Theme
from app.schemas.theme import ThemeCreate, ThemeUpdate


class CRUDTheme(CRUDBase[Theme, ThemeCreate, ThemeUpdate]):
    # You can add specific CRUD methods for themes here if needed
    pass


crud_theme = CRUDTheme(Theme)
