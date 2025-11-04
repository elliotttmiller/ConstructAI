import re

# Read the file
with open('constructai/web/fastapi_app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Count endpoints before
before_count = len(re.findall(r'@app\.(get|post|put|delete)', content))

lines = content.split('\n')
new_lines = []
skip_mode = False
line_num = 0

for i, line in enumerate(lines, 1):
    # Check if we're starting upload_document_to_project (around line 604)
    if '@app.post("/api/projects/{project_id}/documents/upload")' in line and i < 1000:
        print(f"Found upload_document_to_project at line {i}, starting skip...")
        skip_mode = True
        continue
    # Check if we're starting upload_document_autonomous
    elif '@app.post("/api/projects/{project_id}/documents/upload-autonomous")' in line:
        print(f"Found upload_document_autonomous at line {i}, starting skip...")
        skip_mode = True
        continue
    
    # If we're skipping and hit another @app decorator, stop skipping
    if skip_mode and line.strip().startswith('@app.'):
        print(f"Hit next endpoint at line {i}, stopping skip")
        skip_mode = False
        new_lines.append(line)
        continue
    
    # If not skipping, keep the line
    if not skip_mode:
        new_lines.append(line)

# Write back
with open('constructai/web/fastapi_app.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

# Count after
after_count = len(re.findall(r'@app\.(get|post|put|delete)', '\n'.join(new_lines)))

print(f'\n✅ Removed deprecated upload endpoints')
print(f'📊 Endpoints: {before_count} → {after_count} (removed {before_count - after_count})')
print(f'📄 Lines: {len(lines)} → {len(new_lines)} (removed {len(lines) - len(new_lines)})')
