#!/usr/bin/env bash
set -euo pipefail

backup_name=${1:-}
if [[ ! "$backup_name" =~ ^TaskieDB_[0-9]{8}T[0-9]{6}Z\.bak$ ]]; then
  echo "Usage: task database:restore -- TaskieDB_YYYYMMDDTHHMMSSZ.bak" >&2
  exit 1
fi

backup_path="/var/opt/mssql/backups/${backup_name}"
if [[ ! -f "$backup_path" ]]; then
  echo "Backup not found at backups/${backup_name}" >&2
  exit 1
fi

/opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C -b -d master \
  -Q "
BEGIN TRY
    IF DB_ID(N'TaskieDB') IS NOT NULL
        ALTER DATABASE [TaskieDB] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    RESTORE DATABASE [TaskieDB] FROM DISK = N'${backup_path}' WITH REPLACE, RECOVERY;
    ALTER DATABASE [TaskieDB] SET MULTI_USER;
END TRY
BEGIN CATCH
    IF DB_ID(N'TaskieDB') IS NOT NULL
        ALTER DATABASE [TaskieDB] SET MULTI_USER;
    THROW;
END CATCH"

echo "TaskieDB restored from backups/${backup_name}"
