"""
Pydantic V1 to V2 Migration Script
Updates class Config to model_config in all schema files.
"""
import pathlib

# Set your backend folder
base_path = pathlib.Path("apps/backend/schemas")

# Loop through all Python files
for file_path in base_path.rglob("*.py"):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original_content = content
    
    # Replace 'class Config:' with 'model_config ='
    # Pattern 1: from_attributes = True
    content = content.replace(
        "class Config:\n        from_attributes = True",
        "model_config = {\"from_attributes\": True}"
    )
    
    # Pattern 2: orm_mode = True (also valid in V1)
    content = content.replace(
        "class Config:\n        orm_mode = True",
        "model_config = {\"from_attributes\": True}"
    )
    
    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[UPDATED] {file_path}")
    else:
        print(f"[SKIPPED] {file_path} (no changes)")
