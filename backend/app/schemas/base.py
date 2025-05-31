from pydantic import BaseModel, ConfigDict
import humps

# Helper function for Pydantic v2 alias generation
def to_camel(string: str) -> str:
    return humps.camelize(string)

class CamelCaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True  # Equivalent to orm_mode = True in Pydantic v1
    )
