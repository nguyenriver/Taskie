# SQL migration workflow

`docs/Taskie.sql` creates a brand-new local database. Every later schema change belongs in this directory.

1. Create the next sequential file using `NNN_lowercase_name.sql`, for example `002_add_card_labels.sql`.
2. Make the SQL safe for the current schema. Use a transaction for multi-statement changes when SQL Server supports it.
3. Run `task database:migrate`.
4. Do not edit a migration after it has been shared or applied. Add another migration instead.

The initializer records successful filenames in `dbo.SchemaMigrations`. Failed scripts are not recorded and will be retried on the next migration run.
