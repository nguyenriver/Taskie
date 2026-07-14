#!/usr/bin/env bash
set -euo pipefail

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_name="TaskieDB_${timestamp}.bak"
backup_path="/var/opt/mssql/backups/${backup_name}"

/opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C -b \
  -Q "BACKUP DATABASE [TaskieDB] TO DISK = N'${backup_path}' WITH COPY_ONLY, CHECKSUM, COMPRESSION"

/opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C -b \
  -Q "RESTORE VERIFYONLY FROM DISK = N'${backup_path}' WITH CHECKSUM"

echo "Verified backup created at backups/${backup_name}"
