from pydantic import BaseModel


class ApiKeyCreate(BaseModel):
    name: str


class ApiKeyOut(BaseModel):
    id: str
    name: str
    key_preview: str
    created_at: str