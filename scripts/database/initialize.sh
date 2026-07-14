#!/usr/bin/env bash
set -euo pipefail

sqlcmd=/opt/mssql-tools/bin/sqlcmd

echo "SQL Server is ready. Checking TaskieDB..."
database_exists=$($sqlcmd -S db -U sa -P "${SA_PASSWORD}" -h -1 -W \
  -Q "SET NOCOUNT ON; SELECT CASE WHEN DB_ID(N'TaskieDB') IS NULL THEN 0 ELSE 1 END" \
  | tr -d '[:space:]')

if [[ "$database_exists" == "0" ]]; then
  $sqlcmd -b -S db -U sa -P "${SA_PASSWORD}" -i /usr/config/Taskie.sql
  echo "TaskieDB initialized."
elif [[ "$database_exists" == "1" ]]; then
  echo "TaskieDB already exists. Preserving current data."
else
  echo "Unexpected database existence result '${database_exists}'." >&2
  exit 1
fi

$sqlcmd -b -S db -U sa -P "${SA_PASSWORD}" -d TaskieDB -Q "
IF OBJECT_ID(N'dbo.SchemaMigrations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SchemaMigrations
    (
        MigrationID NVARCHAR(255) NOT NULL PRIMARY KEY,
        AppliedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END"

shopt -s nullglob
for migration_path in /usr/config/migrations/*.sql; do
  migration_id=$(basename "$migration_path" .sql)
  if [[ ! "$migration_id" =~ ^[0-9]{3}_[a-z0-9_]+$ ]]; then
    echo "Invalid migration filename '${migration_id}.sql'. Use 001_lowercase_name.sql." >&2
    exit 1
  fi

  migration_applied=$($sqlcmd -S db -U sa -P "${SA_PASSWORD}" -d TaskieDB -h -1 -W \
    -Q "SET NOCOUNT ON; SELECT COUNT(1) FROM dbo.SchemaMigrations WHERE MigrationID = N'${migration_id}'" \
    | tr -d '[:space:]')

  if [[ "$migration_applied" == "0" ]]; then
    echo "Applying migration ${migration_id}..."
    $sqlcmd -b -S db -U sa -P "${SA_PASSWORD}" -d TaskieDB -i "$migration_path"
    $sqlcmd -b -S db -U sa -P "${SA_PASSWORD}" -d TaskieDB \
      -Q "INSERT INTO dbo.SchemaMigrations (MigrationID) VALUES (N'${migration_id}')"
  elif [[ "$migration_applied" == "1" ]]; then
    echo "Migration ${migration_id} already applied."
  else
    echo "Unexpected migration state '${migration_applied}' for ${migration_id}." >&2
    exit 1
  fi
done

echo "TaskieDB schema is up to date."
